import { Campaign, Context, DecisionResult, MLResult, ProductLine, Region, Channel } from './types';

// 1. Data Cleaning & Validation
export function cleanCampaigns(campaigns: Campaign[]): Campaign[] {
    return campaigns.map(c => {
        const cleaned = { ...c };
        cleaned.issues = [];
        let quality_score = 1.0;

        // Imputation: avg_acv_eur
        if (cleaned.avg_acv_eur <= 0) {
            const peers = campaigns.filter(p => p.product_line === cleaned.product_line && p.region === cleaned.region && p.avg_acv_eur > 0);
            const median = peers.length > 0 ? peers.sort((a, b) => a.avg_acv_eur - b.avg_acv_eur)[Math.floor(peers.length / 2)].avg_acv_eur : 50000;
            cleaned.avg_acv_eur = median;
            cleaned.issues.push(`Imputed ACV using ${cleaned.product_line}/${cleaned.region} median`);
            quality_score -= 0.15;
        }

        // Imputation: win_rate
        if (cleaned.win_rate <= 0) {
            const peers = campaigns.filter(p => p.channel === cleaned.channel && p.win_rate > 0);
            const avg = peers.length > 0 ? peers.reduce((acc, p) => acc + p.win_rate, 0) / peers.length : 0.2;
            cleaned.win_rate = avg;
            cleaned.issues.push(`Imputed win_rate using ${cleaned.channel} average`);
            quality_score -= 0.15;
        }

        // Default: retention_uplift_pp
        if (cleaned.retention_uplift_pp === undefined || isNaN(cleaned.retention_uplift_pp)) {
            cleaned.retention_uplift_pp = 0;
            cleaned.issues.push('Missing retention_uplift_pp defaulted to 0');
            quality_score -= 0.15;
        }

        // Outlier Detection: High Cost
        const channelPeers = campaigns.filter(p => p.channel === cleaned.channel);
        const sortedCosts = channelPeers.map(p => p.cost_eur).sort((a, b) => a - b);
        const p95 = sortedCosts[Math.floor(sortedCosts.length * 0.95)] || cleaned.cost_eur;
        if (cleaned.cost_eur > p95 * 1.5) {
            cleaned.issues.push('High cost outlier detected');
            quality_score -= 0.15;
        }

        // Outlier Detection: Conversion
        if (cleaned.win_rate > 0.9 || cleaned.win_rate < 0.05) {
            cleaned.issues.push('Unstable conversion rate');
            quality_score -= 0.15;
        }

        // Outlier Detection: Long Cycle
        if (cleaned.sales_cycle_days > 180) {
            cleaned.issues.push('Extreme sales cycle length');
            quality_score -= 0.15;
        }

        cleaned.data_quality_score = Math.max(0.4, quality_score);
        return cleaned;
    });
}

// 2. Calculations
export function calculateDecision(campaign: Campaign, context: Context): DecisionResult {
    const {
        cost_eur,
        opps_created,
        deals_won,
        avg_acv_eur,
        win_rate,
        sales_cycle_days,
        retention_uplift_pp,
        data_quality_score
    } = campaign;

    // ACV Contribution
    const actual_acv = deals_won * avg_acv_eur;
    const expected_acv = opps_created * win_rate * avg_acv_eur;
    const contribution_score = 0.6 * expected_acv + 0.4 * actual_acv;

    // ROI
    const roi = cost_eur > 0 ? contribution_score / cost_eur : 0;

    // Risk Score
    const volume_risk = 1 / Math.sqrt(Math.max(opps_created, 1));
    const cycle_risk = Math.min(sales_cycle_days / 120, 1);
    const retention_risk = retention_uplift_pp < 0 ? 0.2 : 0;
    const base_risk_score = Math.min(Math.max(0.5 * volume_risk + 0.4 * cycle_risk + retention_risk, 0), 1);

    // Adjusted Risk (incorporate Data Quality)
    const adjusted_risk_score = Math.min(base_risk_score + (1 - data_quality_score) * 0.4, 1);

    // Threshold
    let roi_threshold = context.base_roi_threshold;
    if (context.company_stage === 'Cash-Constrained') roi_threshold += 0.6;
    if (context.company_stage === 'Optimize') roi_threshold += 0.3;
    if (context.strategic_priority === 'Profit') roi_threshold += 0.4;
    if (context.strategic_priority === 'Retention') roi_threshold += 0.2;
    if (context.risk_tolerance === 'High') roi_threshold -= 0.2;
    if (context.risk_tolerance === 'Medium') roi_threshold -= 0.1;

    // Decision
    let decision: DecisionResult['decision'] = 'STOP / REDESIGN';
    let next_owner: DecisionResult['next_owner'] = 'Marketing';
    const reasons: string[] = [];

    if (roi >= roi_threshold && adjusted_risk_score <= 0.45) {
        decision = 'AUTO-APPROVE';
        next_owner = 'Marketing';
        reasons.push(`ROI (${roi.toFixed(2)}) is above threshold (${roi_threshold.toFixed(2)}).`);
        reasons.push(`Risk score (${adjusted_risk_score.toFixed(2)}) is well within tolerance.`);
    } else if (roi >= roi_threshold - 0.3 && adjusted_risk_score <= 0.7) {
        decision = 'FINANCE REVIEW';
        next_owner = 'Finance';
        reasons.push(`ROI (${roi.toFixed(2)}) is marginal relative to threshold (${roi_threshold.toFixed(2)}).`);
        reasons.push(`Medium risk profile (${adjusted_risk_score.toFixed(2)}) requires oversight.`);
    } else {
        decision = 'STOP / REDESIGN';
        next_owner = 'Sales Ops';
        if (roi < roi_threshold - 0.3) reasons.push(`Insufficient ROI (${roi.toFixed(2)}) vs target.`);
        if (adjusted_risk_score > 0.7) reasons.push(`High risk score (${adjusted_risk_score.toFixed(2)}) is unacceptable.`);
    }

    if (data_quality_score < 0.8) {
        reasons.push(`Note: Decision uncertainty is high due to data quality (${data_quality_score.toFixed(2)}).`);
    }

    const recommended_action = decision === 'AUTO-APPROVE'
        ? 'Proceed with budget expansion for current quarter.'
        : decision === 'FINANCE REVIEW'
            ? 'Prepare detailed unit economics breakdown for Finance.'
            : 'Re-evaluate channel alignment or product-market fit.';

    return {
        roi,
        roi_threshold,
        risk_score: base_risk_score,
        adjusted_risk_score,
        decision,
        decision_reason: reasons,
        recommended_action,
        next_owner,
    };
}

// 3. Similarity Engine (Explainable ML)
export function findSimilarCampaigns(target: Campaign, all: Campaign[]): MLResult {
    // Simple Cosine Similarity based on key features
    const getFeatures = (c: Campaign) => [
        Math.log10(Math.max(c.cost_eur, 1)) / 5,
        Math.log10(Math.max(c.avg_acv_eur, 1)) / 6,
        c.win_rate,
        c.sales_cycle_days / 200,
        (c.retention_uplift_pp + 5) / 10,
        c.channel === target.channel ? 1 : 0,
        c.region === target.region ? 1 : 0,
        c.product_line === target.product_line ? 1 : 0,
    ];

    const targetFeatures = getFeatures(target);

    const similarities = all
        .filter(c => c.campaign_id !== target.campaign_id)
        .map(c => {
            const feat = getFeatures(c);
            // Cosine Similarity
            const dotProduct = targetFeatures.reduce((acc, val, i) => acc + val * feat[i], 0);
            const mag1 = Math.sqrt(targetFeatures.reduce((acc, val) => acc + val * val, 0));
            const mag2 = Math.sqrt(feat.reduce((acc, val) => acc + val * val, 0));
            const similarity = dotProduct / (mag1 * mag2);

            return {
                campaign_id: c.campaign_id,
                similarity,
                // We'll need the decision for the similar campaign, but that depends on context
                // For simplicity, we'll return the ID and similarity, and the store will enrich it
            };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

    return {
        similar_campaigns: similarities.map(s => ({
            campaign_id: s.campaign_id,
            similarity: s.similarity,
            roi: 0, // Placeholder, to be filled by caller
            decision: '', // Placeholder
        })),
    };
}
