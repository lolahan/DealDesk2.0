'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Info,
    RotateCcw,
    SlidersHorizontal,
    Trash2,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataEditor() {
    const {
        campaigns,
        cleanedCampaigns,
        context,
        addCampaign,
        removeCampaign,
        updateCampaign,
        updateContext,
        resetData,
        selectedCampaignId,
        setSelectedCampaignId
    } = useStore();

    const selectedCampaign = cleanedCampaigns.find(c => c.campaign_id === selectedCampaignId);

    return (
        <div className="flex h-full gap-6">
            {/* Left Column: Campaigns Table */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Campaign Data Engine</h2>
                        <p className="text-slate-400 text-sm mt-1">Real-time simulation and data quality control.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={addCampaign}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-all shadow-lg shadow-emerald-600/20 border border-emerald-500/50"
                        >
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </button>
                        <button
                            onClick={resetData}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset to Source
                        </button>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto flex-1">
                        <table className="sn-table">
                            <thead className="sticky top-0 z-10 glass-panel">
                                <tr>
                                    <th className="w-16">ID</th>
                                    <th>Campaign Name</th>
                                    <th>Channel</th>
                                    <th>Cost (EUR)</th>
                                    <th>ACV (EUR)</th>
                                    <th>Win Rate</th>
                                    <th>Quality</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cleanedCampaigns.map((c) => (
                                    <tr
                                        key={c.campaign_id}
                                        onClick={() => setSelectedCampaignId(c.campaign_id)}
                                        className={`cursor-pointer ${selectedCampaignId === c.campaign_id ? 'bg-emerald-500/10' : ''}`}
                                    >
                                        <td className="font-mono text-emerald-500 text-xs">{c.campaign_id}</td>
                                        <td className="font-medium max-w-[200px] truncate">{c.campaign_name}</td>
                                        <td>
                                            <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700">
                                                {c.channel}
                                            </span>
                                        </td>
                                        <td className="font-mono">€{c.cost_eur.toLocaleString()}</td>
                                        <td className="font-mono">€{c.avg_acv_eur.toLocaleString()}</td>
                                        <td className="font-mono">{(c.win_rate * 100).toFixed(2)}%</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${c.data_quality_score > 0.8 ? 'bg-emerald-500' : c.data_quality_score > 0.6 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${c.data_quality_score * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">{(c.data_quality_score * 100).toFixed(2)}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeCampaign(c.campaign_id);
                                                }}
                                                className="p-1.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Column: Context & Detail Panel */}
            <div className="w-96 flex flex-col gap-6 h-full overflow-y-auto pr-2 text-slate-900">
                {/* Global Context */}
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl space-y-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold border-b border-slate-100 pb-4">
                        <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                        <span>Global Strategic Context</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Stage</label>
                            <select
                                value={context.company_stage}
                                onChange={(e) => updateContext({ company_stage: e.target.value as any })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500/50"
                            >
                                <option value="Scale">Scale (Growth Focus)</option>
                                <option value="Optimize">Optimize (Efficiency Focus)</option>
                                <option value="Cash-Constrained">Cash-Constrained (Survival)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Strategic Priority</label>
                            <select
                                value={context.strategic_priority}
                                onChange={(e) => updateContext({ strategic_priority: e.target.value as any })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500/50"
                            >
                                <option value="Growth">Growth (Maximize ACV)</option>
                                <option value="Profit">Profit (Maximize ROI)</option>
                                <option value="Retention">Retention (LTV focus)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base ROI Threshold</label>
                                <span className="text-emerald-600 font-mono text-sm font-bold">{context.base_roi_threshold.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="5.0"
                                step="0.1"
                                value={context.base_roi_threshold}
                                onChange={(e) => updateContext({ base_roi_threshold: parseFloat(e.target.value) })}
                                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Selected Campaign What-if */}
                {selectedCampaign ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl space-y-6 flex-1 border border-emerald-200 shadow-sm text-slate-900"
                    >
                        <div className="flex items-center gap-2 text-slate-900 font-semibold border-b border-slate-100 pb-4">
                            <AlertCircle className="w-4 h-4 text-emerald-600" />
                            <span>What-if Simulator: {selectedCampaign.campaign_id}</span>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Cost (EUR)</label>
                                </div>
                                <input
                                    type="number"
                                    value={selectedCampaign.cost_eur}
                                    onChange={(e) => updateCampaign(selectedCampaign.campaign_id, { cost_eur: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg ACV (EUR)</label>
                                </div>
                                <input
                                    type="number"
                                    value={selectedCampaign.avg_acv_eur}
                                    onChange={(e) => updateCampaign(selectedCampaign.campaign_id, { avg_acv_eur: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                                />
                            </div>

                            {/* Data Quality Issues */}
                            <div className="pt-4 border-t border-slate-800 space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Decision Integrity Checks</h4>
                                <div className="space-y-2">
                                    {selectedCampaign.issues.length > 0 ? (
                                        selectedCampaign.issues.map((issue, i) => (
                                            <div key={i} className="flex gap-2 items-start text-xs text-amber-500 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                                                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                                <span>{issue}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex gap-2 items-start text-xs text-emerald-500 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                            <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                                            <span>Data meets high integrity standards. No active issues.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="glass-panel p-8 rounded-2xl flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                            <ChevronRight className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                            <p className="text-slate-400 font-medium">Select a campaign</p>
                            <p className="text-slate-500 text-xs">to run What-if simulations</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
