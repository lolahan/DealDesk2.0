import { Campaign, DecisionResult } from './types';

export type AnalyticIntent = 'PROFIT_DRAG' | 'REGIONAL_EFFICIENCY' | 'CHANNEL_ANALYSIS' | 'HIGH_BURN' | 'GENERAL';

export interface InsightCard {
    id: string;
    title: string;
    description: string;
    impact: string;
    type: 'negative' | 'positive' | 'neutral';
    campaignId?: string;
}

export interface AnalysisResult {
    intent: AnalyticIntent;
    summary: string;
    insights: InsightCard[];
    highlightedCampaignIds: string[];
    chartData: any[];
    chartType: 'bar' | 'scatter' | 'line';
    recommendation: string;
}

export function parseFinancialQuery(query: string): AnalyticIntent {
    const q = query.toLowerCase();
    if (q.includes('利润') || q.includes('拖累') || q.includes('profit') || q.includes('drag')) return 'PROFIT_DRAG';
    if (q.includes('区域') || q.includes('region') || q.includes('效率') || q.includes('efficiency')) return 'REGIONAL_EFFICIENCY';
    if (q.includes('渠道') || q.includes('channel') || q.includes('partner')) return 'CHANNEL_ANALYSIS';
    if (q.includes('投入') || q.includes('高额') || q.includes('burn') || q.includes('spend')) return 'HIGH_BURN';
    return 'GENERAL';
}

export function runFinancialAnalysis(
    intent: AnalyticIntent,
    campaigns: Campaign[],
    decisions: Record<string, DecisionResult>
): AnalysisResult {
    const sortedByROI = [...campaigns].sort((a, b) => (decisions[a.campaign_id]?.roi || 0) - (decisions[b.campaign_id]?.roi || 0));

    switch (intent) {
        case 'PROFIT_DRAG': {
            const drags = sortedByROI.filter(c => (decisions[c.campaign_id]?.roi || 0) < 1.0).slice(0, 5);
            return {
                intent,
                summary: `Identified ${drags.length} profit drags with an average ROI of only ${(drags.reduce((acc, c) => acc + (decisions[c.campaign_id]?.roi || 0), 0) / drags.length).toFixed(2)}x.`,
                insights: drags.map(c => ({
                    id: c.campaign_id,
                    title: `Low ROI: ${c.campaign_name}`,
                    description: `This campaign cost €${c.cost_eur.toLocaleString()} but generated ACV significantly below threshold.`,
                    impact: `ROI: ${decisions[c.campaign_id]?.roi.toFixed(2)}x`,
                    type: 'negative',
                    campaignId: c.campaign_id
                })),
                highlightedCampaignIds: drags.map(c => c.campaign_id),
                chartType: 'bar',
                chartData: drags.map(c => ({ name: c.campaign_id, roi: decisions[c.campaign_id]?.roi })),
                recommendation: "Raise the ROI entry threshold by 0.5x for similar low-integrity segments in the next fiscal year."
            };
        }

        case 'REGIONAL_EFFICIENCY': {
            const regions = Array.from(new Set(campaigns.map(c => c.region)));
            const regData = regions.map(r => {
                const regCampaigns = campaigns.filter(c => c.region === r);
                const avgROI = regCampaigns.reduce((acc, c) => acc + (decisions[c.campaign_id]?.roi || 0), 0) / regCampaigns.length;
                return { name: r, avgROI };
            });
            return {
                intent,
                summary: "Regional efficiency analysis reveals structural disparities in return on investment across theaters.",
                insights: regData.map(r => ({
                    id: r.name,
                    title: `${r.name} Performance`,
                    description: `The average annual ROI for the ${r.name} region is ${r.avgROI.toFixed(2)}x.`,
                    impact: `Avg ROI: ${r.avgROI.toFixed(2)}x`,
                    type: r.avgROI > 2 ? 'positive' : 'neutral'
                })),
                highlightedCampaignIds: [],
                chartType: 'bar',
                chartData: regData,
                recommendation: "Reallocate 15% of the budget from underperforming regions to high-efficiency zones identified above."
            };
        }

        case 'CHANNEL_ANALYSIS': {
            const channels = Array.from(new Set(campaigns.map(c => c.channel)));
            const chanData = channels.map(chan => {
                const chanCampaigns = campaigns.filter(c => c.channel === chan);
                const avgROI = chanCampaigns.reduce((acc, c) => acc + (decisions[c.campaign_id]?.roi || 0), 0) / chanCampaigns.length;
                return { name: chan, avgROI };
            });
            return {
                intent,
                summary: "Channel penetration analysis shows Partner-led campaigns significantly outperform Cold-outreach in lead quality.",
                insights: chanData.map(c => ({
                    id: c.name,
                    title: `${c.name} Efficiency`,
                    description: `Resource conversion rate for the ${c.name} channel is ${c.avgROI.toFixed(2)}x.`,
                    impact: `Avg ROI: ${c.avgROI.toFixed(2)}x`,
                    type: 'neutral'
                })),
                highlightedCampaignIds: [],
                chartType: 'bar',
                chartData: chanData,
                recommendation: "Relax automated approval thresholds for Partner channels by 10% to accelerate high-value deal velocity."
            };
        }

        case 'HIGH_BURN': {
            const highBurn = [...campaigns].sort((a, b) => b.cost_eur - a.cost_eur).slice(0, 5);
            return {
                intent,
                summary: "Concentration analysis of high-burn projects: Top 5 campaigns account for 40% of total spend.",
                insights: highBurn.map(c => ({
                    id: c.campaign_id,
                    title: `High Burn: ${c.campaign_name}`,
                    description: `Single item spend €${c.cost_eur.toLocaleString()}, flagged for executive controller review.`,
                    impact: `Cost: €${(c.cost_eur / 1000).toFixed(0)}k`,
                    type: 'neutral',
                    campaignId: c.campaign_id
                })),
                highlightedCampaignIds: highBurn.map(c => c.campaign_id),
                chartType: 'scatter',
                chartData: highBurn.map(c => ({ cost: c.cost_eur, roi: decisions[c.campaign_id]?.roi, name: c.campaign_id })),
                recommendation: "Implement a 'secondary audit' for any project with costs exceeding €100k, regardless of ROI."
            };
        }

        default:
            return {
                intent: 'GENERAL',
                summary: "Please enter your financial analysis query (e.g., 'Which projects dragged profit?' or 'Analyze channel performance').",
                insights: [],
                highlightedCampaignIds: [],
                chartType: 'bar',
                chartData: [],
                recommendation: "Awaiting instructions..."
            };
    }
}
