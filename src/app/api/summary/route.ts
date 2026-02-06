import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    try {
        const { input, outcome, flags, terms } = await req.json();

        const apiKey = process.env.OPENAI_API_KEY;

        if (apiKey) {
            const openai = new OpenAI({ apiKey });
            const prompt = `
        As a GTM Finance Analyst, provide a concise deal summary (under 120 words).
        
        Input Data:
        - Base ARR: $${input.baseARR}
        - AI ARR: $${input.aiARR}
        - Discount: ${input.discountRate}%
        - Partner Involved: ${input.partner ? 'Yes' : 'No'}
        
        Outcome:
        - Decision: ${outcome.decision}
        - Net Margin: ${(outcome.netMargin * 100).toFixed(1)}%
        - Net Contribution: $${outcome.netContribution.toFixed(0)}
        
        Risk Flags: ${flags.join(', ') || 'None'}
        Suggested Terms: ${terms.join(' | ')}

        Format with exactly these labels:
        Decision: [Summary]
        Why: [Reasoning]
        Risks: [Risk Assessment]
        Suggested terms: [Actionable items]
      `;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 250,
            });

            return NextResponse.json({ summary: response.choices[0].message.content });
        } else {
            // Deterministic Fallback Template
            const summary = `
Decision: ${outcome.decision} (Net Margin: ${(outcome.netMargin * 100).toFixed(1)}%)
Why: The deal generates a net contribution of $${outcome.netContribution.toFixed(0)} with a ${input.discountRate}% discount rate. The balance of Base ARR ($${input.baseARR}) vs AI ARR ($${input.aiARR}) results in a weighted contribution that meets ${outcome.decision === 'APPROVE' ? 'all' : 'partial'} guardrail requirements.
Risks: ${flags.length > 0 ? flags.join('. ') : 'Standard deal execution risks only.'}
Suggested terms: ${terms.slice(0, 2).join('. ')}
      `.trim();

            return NextResponse.json({ summary });
        }
    } catch (error) {
        console.error('Summary API Error:', error);
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}
