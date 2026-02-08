import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign, Context, DecisionResult, MLResult, FinancialRecord, ExplorationResult } from './types';
import { MOCK_CAMPAIGNS, INITIAL_CONTEXT } from './mockData';
import { FINANCIAL_DATA } from './financialMockData';
import { cleanCampaigns, calculateDecision, findSimilarCampaigns } from './engine';
import { runFinancialExploration } from './explorerEngine';

interface AppState {
    campaigns: Campaign[];
    context: Context;
    financialData: FinancialRecord[];
    explorationResult: ExplorationResult | null;

    // Derived Data
    cleanedCampaigns: Campaign[];
    decisions: Record<string, DecisionResult>;
    similarities: Record<string, MLResult>;

    // Actions
    addCampaign: () => void;
    removeCampaign: (id: string) => void;
    updateCampaign: (id: string, updates: Partial<Campaign>) => void;
    updateContext: (updates: Partial<Context>) => void;
    runExploration: (query: string) => void;
    resetData: () => void;
    setActiveTab: (tab: number) => void;
    setSelectedCampaignId: (id: string | null) => void;
    recalculate: () => void;

    // UI State
    activeTab: number; // 0: Editor, 1: Dashboard, 2: Router, 3: Explorer
    selectedCampaignId: string | null;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            campaigns: MOCK_CAMPAIGNS,
            context: INITIAL_CONTEXT,
            financialData: FINANCIAL_DATA,
            explorationResult: null,

            cleanedCampaigns: [],
            decisions: {},
            similarities: {},
            activeTab: 0,
            selectedCampaignId: null,

            setActiveTab: (tab) => set({ activeTab: tab }),
            setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),

            runExploration: (query) => {
                const result = runFinancialExploration(query, get().financialData);
                set({ explorationResult: result });
            },

            addCampaign: () => {
                const maxId = get().campaigns.reduce((max, c) => {
                    const idNum = parseInt(c.campaign_id.substring(1)) || 0;
                    return Math.max(max, idNum);
                }, 0);
                const newId = `C${(maxId + 1).toString().padStart(3, '0')}`;
                const newCampaign: Campaign = {
                    campaign_id: newId,
                    campaign_name: `New Campaign ${newId}`,
                    quarter: '2026Q1',
                    region: 'EMEA',
                    channel: 'Webinar',
                    product_line: 'ITSM',
                    cost_eur: 50000,
                    leads: 500,
                    mqls: 150,
                    sqls: 50,
                    opps_created: 20,
                    deals_won: 4,
                    avg_acv_eur: 100000,
                    win_rate: 0.2,
                    sales_cycle_days: 90,
                    retention_uplift_pp: 0,
                    notes: 'Newly created campaign.',
                    data_quality_score: 1.0,
                    issues: []
                };
                set((state) => ({ campaigns: [...state.campaigns, newCampaign] }));
                get().recalculate();
            },

            removeCampaign: (id) => {
                set((state) => ({
                    campaigns: state.campaigns.filter((c) => c.campaign_id !== id),
                    selectedCampaignId: state.selectedCampaignId === id ? null : state.selectedCampaignId
                }));
                get().recalculate();
            },

            updateCampaign: (id, updates) => {
                set((state) => ({
                    campaigns: state.campaigns.map((c) =>
                        c.campaign_id === id ? { ...c, ...updates } : c
                    ),
                }));
                get().recalculate();
            },

            updateContext: (updates) => {
                set((state) => ({
                    context: { ...state.context, ...updates },
                }));
                get().recalculate();
            },

            resetData: () => {
                set({ campaigns: MOCK_CAMPAIGNS, context: INITIAL_CONTEXT });
                get().recalculate();
            },

            recalculate: () => {
                const { campaigns, context } = get();
                const cleaned = cleanCampaigns(campaigns);

                const decisions: Record<string, DecisionResult> = {};
                cleaned.forEach((c) => {
                    decisions[c.campaign_id] = calculateDecision(c, context);
                });

                const similarities: Record<string, MLResult> = {};
                cleaned.forEach((c) => {
                    const res = findSimilarCampaigns(c, cleaned);
                    // Enrich similarity results with ROI and Decision
                    res.similar_campaigns = res.similar_campaigns.map(s => ({
                        ...s,
                        roi: decisions[s.campaign_id]?.roi || 0,
                        decision: decisions[s.campaign_id]?.decision || '',
                    }));
                    similarities[c.campaign_id] = res;
                });

                set({ cleanedCampaigns: cleaned, decisions, similarities });
            },
        }),
        {
            name: 'market-ai-store',
            onRehydrateStorage: () => (state) => {
                if (state) state.recalculate();
            },
        }
    )
);
