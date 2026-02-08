export type Region = 'EMEA' | 'NA' | 'APAC';
export type Channel = 'Paid Search' | 'LinkedIn' | 'Webinar' | 'Event' | 'Partner';
export type ProductLine = 'ITSM' | 'CSM' | 'SecOps';
export type CompanyStage = 'Scale' | 'Optimize' | 'Cash-Constrained';
export type StrategicPriority = 'Growth' | 'Profit' | 'Retention';
export type FinanceCapacity = 'Low' | 'Medium' | 'High';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Campaign {
    campaign_id: string;
    campaign_name: string;
    quarter: string;
    region: Region;
    channel: Channel;
    product_line: ProductLine;
    cost_eur: number;
    leads: number;
    mqls: number;
    sqls: number;
    opps_created: number;
    deals_won: number;
    avg_acv_eur: number;
    win_rate: number;
    sales_cycle_days: number;
    retention_uplift_pp: number;
    notes: string;
    // Metadata for data quality
    data_quality_score: number;
    issues: string[];
}

export interface Context {
    company_stage: CompanyStage;
    strategic_priority: StrategicPriority;
    finance_capacity: FinanceCapacity;
    base_roi_threshold: number;
    risk_tolerance: RiskLevel;
}

export interface DecisionResult {
    roi: number;
    roi_threshold: number;
    risk_score: number;
    adjusted_risk_score: number;
    decision: 'AUTO-APPROVE' | 'FINANCE REVIEW' | 'STOP / REDESIGN';
    decision_reason: string[];
    recommended_action: string;
    next_owner: 'Marketing' | 'Sales Ops' | 'Finance';
}

export interface MLResult {
    similar_campaigns: {
        campaign_id: string;
        similarity: number;
        roi: number;
        decision: string;
    }[];
}
export interface FinancialRecord {
    id: string;
    company: 'ByrnSil' | 'Kopix';
    division: string;
    project: string;
    cost: number;
    revenue: number;
    profit: number;
}

export interface ExplorationResult {
    summary: string;
    chartType: 'bar' | 'pie' | 'line' | 'scatter';
    chartData: any[];
    highlightedRowIds: string[];
    insight: string;
    deepInsights: string[];
    horizontalComparison?: {
        metric: string;
        byrnSilValue: number;
        kopixValue: number;
    };
}
