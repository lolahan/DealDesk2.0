"use strict";

import { PricingInput, PricingOutcome } from './pricing';

export function suggestTerms(input: PricingInput, outcome: PricingOutcome): string[] {
    const suggestions: string[] = [];

    // Logic for high discount
    if (input.discountRate > 0.25) {
        suggestions.push(
            "Implement a strict discount cap on renewal periods to protect future revenue.",
            "Execute a 'give-to-get' strategy: offer the current discount only in exchange for a 3-year term commitment."
        );
    }

    // Logic for partner involved and low margin
    if (input.partner && outcome.netMargin < 0.55) {
        suggestions.push(
            "Negotiate a reduced partner take-rate or shift to a fixed referral fee to stabilize net margin.",
            "Tighten referral rules requiring higher direct sales involvement for high-discount deals."
        );
    }

    // Logic for high AI ARR share and weighted margin pressure
    const aiShare = input.aiARR / (input.baseARR + input.aiARR || 1);
    if (aiShare > 0.4) {
        suggestions.push(
            "Establish usage floors and clear overage pricing to mitigate high COGS associated with AI services.",
            "Consider a phased ramp for AI seat deployment to align costs with customer value realization.",
            "Bundle AI with premium support tiers to cross-subsidize delivery costs and improve deal mix."
        );
    }

    // Fallback / General suggestions if list is still small
    if (suggestions.length < 3) {
        suggestions.push(
            "Standardize SLA terms to avoid bespoke engineering commitments that erode margin.",
            "Implement quarterly business reviews (QBRs) to monitor value realization and upsell potential."
        );
    }

    // Limit to 6 suggestions as requested
    return suggestions.slice(0, 6);
}
