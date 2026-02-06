"use strict";

export type Decision = 'APPROVE' | 'CONDITIONAL' | 'REJECT';

export interface PricingInput {
    baseARR: number;
    aiARR: number;
    discountRate: number; // as decimal (e.g. 0.2 for 20%)
    partner: boolean;
    partnerTakeRate?: number; // as decimal (e.g. 0.1 for 10%)
}

export interface PricingOutcome {
    baseARR: number;
    aiARR: number;
    totalARR: number;
    grossProfit: number;
    partnerImpact: number;
    netContribution: number;
    netMargin: number;
    decision: Decision;
    flags: string[];
}

const BASE_GROSS_MARGIN = 0.82;
const AI_GROSS_MARGIN = 0.65;

export function calculateDealOutcome(input: PricingInput): PricingOutcome {
    const { baseARR, aiARR, discountRate, partner, partnerTakeRate = 0 } = input;

    const totalARR = baseARR + aiARR;
    const discountedTotalARR = totalARR * (1 - discountRate);

    // Calculate weighted gross profit based on base vs ai mix
    // Note: Assuming discount is applied proportionally if not specified otherwise
    const baseGrossProfit = (baseARR * (1 - discountRate)) * BASE_GROSS_MARGIN;
    const aiGrossProfit = (aiARR * (1 - discountRate)) * AI_GROSS_MARGIN;
    const grossProfit = baseGrossProfit + aiGrossProfit;

    const partnerImpact = partner ? discountedTotalARR * partnerTakeRate : 0;
    const netContribution = grossProfit - partnerImpact;
    const netMargin = discountedTotalARR > 0 ? netContribution / discountedTotalARR : 0;

    const flags: string[] = [];
    let decision: Decision = 'APPROVE';

    if (discountRate > 0.35) {
        flags.push('Aggressive Discounting (>35%)');
    } else if (discountRate > 0.25) {
        flags.push('High Discounting (25-35%)');
    }

    if (netMargin < 0.45) {
        flags.push('Low Net Margin (<45%)');
    } else if (netMargin < 0.55) {
        flags.push('Margin Warning (45-55%)');
    }

    if (partner && partnerTakeRate > 0.15) {
        flags.push('High Partner Take Rate');
    }

    // Decision Logic
    if (netMargin < 0.45 || discountRate > 0.35) {
        decision = 'REJECT';
    } else if ((netMargin >= 0.45 && netMargin <= 0.55) || (discountRate >= 0.25 && discountRate <= 0.35)) {
        decision = 'CONDITIONAL';
    }

    return {
        baseARR,
        aiARR,
        totalARR: discountedTotalARR,
        grossProfit,
        partnerImpact,
        netContribution,
        netMargin,
        decision,
        flags
    };
}
