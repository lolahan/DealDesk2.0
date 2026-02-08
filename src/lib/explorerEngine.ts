import { FinancialRecord, ExplorationResult } from './types';

export function runFinancialExploration(
    query: string,
    data: FinancialRecord[]
): ExplorationResult {
    const q = query.toLowerCase();

    // 1. Division Profit Share (Pie Chart)
    if (q.includes('profit') && (q.includes('division') || q.includes('share') || q.includes('占比'))) {
        const divisions = Array.from(new Set(data.map(d => d.division)));
        const chartData = divisions.map(div => ({
            name: div,
            value: data.filter(d => d.division === div).reduce((acc, d) => acc + Math.max(0, d.profit), 0)
        })).filter(d => d.value > 0);

        const totalProfit = chartData.reduce((acc, d) => acc + d.value, 0);
        const top3 = [...chartData].sort((a, b) => b.value - a.value).slice(0, 3);
        const top3Sum = top3.reduce((acc, d) => acc + d.value, 0);
        const top3Percent = ((top3Sum / totalProfit) * 100).toFixed(0);

        const byrnSilHealth = data.filter(d => d.company === 'ByrnSil' && d.division === 'HealthTech').reduce((acc, d) => acc + d.profit, 0);
        const kopixAI = data.filter(d => d.company === 'Kopix' && d.division === 'AI Labs').reduce((acc, d) => acc + d.profit, 0);

        return {
            summary: "Profit contribution breakdown by division.",
            chartType: 'pie',
            chartData,
            highlightedRowIds: [],
            insight: `The top 3 divisions account for approximately ${top3Percent}% of total corporate profit.`,
            deepInsights: [
                "HealthTech emerges as the primary profit engine for ByrnSil, while AI Labs leads growth for Kopix.",
                "SaaS division shows high revenue variance with significant customer acquisition costs dragging current margins.",
                "Logistics division is currently in a 'Consolidation' phase with stable but low single-digit margins."
            ],
            horizontalComparison: {
                metric: "Division Profitability",
                byrnSilValue: byrnSilHealth,
                kopixValue: kopixAI
            }
        };
    }

    // 2. Company Comparison (Bar Chart)
    if (q.includes('compare') || q.includes('byrnsil') || q.includes('kopix')) {
        const companies = ['ByrnSil', 'Kopix'];
        const chartData = companies.map(comp => ({
            name: comp,
            revenue: data.filter(d => d.company === comp).reduce((acc, d) => acc + d.revenue, 0),
            profit: data.filter(d => d.company === comp).reduce((acc, d) => acc + d.profit, 0)
        }));

        const bRev = chartData.find(c => c.name === 'ByrnSil')?.revenue || 0;
        const kRev = chartData.find(c => c.name === 'Kopix')?.revenue || 0;

        return {
            summary: "Revenue vs Profit comparison between ByrnSil and Kopix.",
            chartType: 'bar',
            chartData,
            highlightedRowIds: [],
            insight: "Kopix shows higher absolute revenue, while ByrnSil maintains a higher profit margin in the HealthTech sector.",
            deepInsights: [
                `Kopix revenue is ${(kRev / bRev).toFixed(1)}x higher than ByrnSil, driven by aggressive Consumer market expansion.`,
                "ByrnSil focus on high-margin Consulting and B2B SaaS results in 12% higher average revenue per project.",
                "Cross-company analysis suggests ByrnSil has better capital efficiency in specialized service lines."
            ],
            horizontalComparison: {
                metric: "Net Margin Performance",
                byrnSilValue: (chartData[0].profit / chartData[0].revenue) * 100,
                kopixValue: (chartData[1].profit / chartData[1].revenue) * 100
            }
        };
    }

    // 3. Negative Profit (Scatter / Highlighting)
    if (q.includes('negative') || q.includes('loss') || q.includes('负')) {
        const negativeProjs = data.filter(d => d.profit < 0);
        const chartData = negativeProjs.map(d => ({
            name: d.project,
            cost: d.cost,
            profit: d.profit,
            revenue: d.revenue
        }));

        return {
            summary: "Analysis of loss-making projects (Negative Profit).",
            chartType: 'scatter',
            chartData,
            highlightedRowIds: negativeProjs.map(d => d.id),
            insight: `Identified ${negativeProjs.length} projects where costs exceed revenue, primarily in expanding SaaS and AI Lab divisions.`,
            deepInsights: [
                "NeuralScan Pro (Kopix) represents the largest single project loss, but is viewed as a strategic AI investment.",
                "ByrnSil's CardioFlow project is suffering from high R&D costs relative to early-stage revenue.",
                "Operational audit recommended for SaaS 'DataSync' to address recurring infrastructure cost overruns."
            ]
        };
    }

    // 4. High Revenue, Low Profit (Bar/Line)
    if (q.includes('high revenue') || (q.includes('revenue') && q.includes('profit'))) {
        const sortedRevenue = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
        return {
            summary: "Top 6 projects by revenue vs their respective profit levels.",
            chartType: 'bar',
            chartData: sortedRevenue.map(d => ({ name: d.project, revenue: d.revenue, profit: d.profit })),
            highlightedRowIds: sortedRevenue.map(d => d.id),
            insight: "Some high-revenue projects like SmartHome Hub have significant operating costs, compressing net margins.",
            deepInsights: [
                "Revenue-to-profit conversion is highest in SaaS 'CloudInventory' due to zero marginal distribution costs.",
                "Physical hardware projects (SmartHome Hub) exhibit significant profit drag from supply chain logistics.",
                "Market share leader 'MRI Optimizer' maintains a dominant profit position despite moderate revenue growth."
            ]
        };
    }

    // Default: List All
    return {
        summary: "Overview of all projects across corporations.",
        chartType: 'bar',
        chartData: [
            { name: 'Revenue', value: data.reduce((acc, d) => acc + d.revenue, 0) },
            { name: 'Cost', value: data.reduce((acc, d) => acc + d.cost, 0) },
            { name: 'Profit', value: data.reduce((acc, d) => acc + d.profit, 0) }
        ],
        highlightedRowIds: [],
        insight: "Ready for deep-dive analysis. Try asking about profit shares, company comparisons, or specific loss areas.",
        deepInsights: [
            "Baseline data shows healthy performance across both ByrnSil and Kopix entities.",
            "Consolidated profit margin stands at approximately 34% for the reporting period.",
            "Ready for segment-specific deep dives into Divisions or Companies."
        ]
    };
}
