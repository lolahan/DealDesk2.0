import React, { useState } from 'react';
import { calculateDealOutcome } from '@/lib/pricing';
import { suggestTerms } from '@/lib/terms';
import { PricingFormData } from './PricingForm';

interface ResultsPanelProps {
    data: PricingFormData;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ data }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const baseARR = data.seats * data.basePricePerSeatPerMonth * 12;
    const aiARR = data.aiUnitsPerMonth * data.aiPricePerUnit * 12;

    const pricingInput = {
        baseARR,
        aiARR,
        discountRate: data.discountRate / 100,
        partner: data.partner,
        partnerTakeRate: data.partnerTakeRate / 100,
    };

    const outcome = calculateDealOutcome(pricingInput);
    const terms = suggestTerms(pricingInput, outcome);

    const generateSummary = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: data,
                    outcome,
                    flags: outcome.flags,
                    terms,
                }),
            });
            const result = await response.json();
            setSummary(result.summary);
        } catch (error) {
            console.error('Error generating summary:', error);
            setSummary('Failed to generate summary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (decision: string) => {
        switch (decision) {
            case 'REJECT':
                return {
                    color: 'text-rose-600 dark:text-rose-400',
                    indicator: 'bg-rose-500',
                    bg: 'bg-rose-500/5',
                    border: 'border-rose-500/20'
                };
            case 'CONDITIONAL':
                return {
                    color: 'text-amber-600 dark:text-amber-400',
                    indicator: 'bg-amber-500',
                    bg: 'bg-amber-500/5',
                    border: 'border-amber-500/20'
                };
            default:
                return {
                    color: 'text-emerald-600 dark:text-emerald-400',
                    indicator: 'bg-emerald-500',
                    bg: 'bg-emerald-500/5',
                    border: 'border-emerald-500/20'
                };
        }
    };

    const status = getStatusStyles(outcome.decision);

    return (
        <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[2.5rem] shadow-[0_12px_40px_rgb(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)] border border-slate-100 dark:border-slate-800/50 h-full flex flex-col transition-all duration-500">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-black dark:bg-white rounded-full" />
                    <h2 className="font-outfit text-2xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
                        Evaluation
                    </h2>
                </div>
                <button
                    onClick={generateSummary}
                    disabled={loading}
                    className="group px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2.5 shadow-xl shadow-black/10 dark:shadow-white/5"
                >
                    {loading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                    ) : (
                        <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" />
                        </svg>
                    )}
                    AI Intelligence
                </button>
            </div>

            <div className={`mb-12 p-10 rounded-[2rem] border ${status.bg} ${status.border} backdrop-blur-sm relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Guardrail Protocol</p>
                        <div className="flex items-center gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${status.indicator} shadow-[0_0_15px_rgba(0,0,0,0.1)] animate-pulse`} />
                            <span className={`font-outfit text-4xl font-black italic tracking-tighter-extra uppercase ${status.color}`}>{outcome.decision}</span>
                        </div>
                    </div>

                    {outcome.flags.length > 0 && (
                        <div className="flex flex-wrap gap-2.5">
                            {outcome.flags.map((flag, idx) => (
                                <span key={idx} className={`px-4 py-1.5 text-[10px] font-black rounded-full border ${status.border} ${status.color} bg-white/80 dark:bg-black uppercase tracking-widest`}>
                                    {flag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {summary && (
                <div className="mb-12 animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex items-center gap-3 mb-5 px-1">
                        <div className="w-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Executive Summary</h3>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-[1.8] font-medium italic relative">
                        <span className="absolute -top-1 left-4 text-6xl font-serif text-slate-100 dark:text-slate-800/80 pointer-events-none italic">“</span>
                        <div className="relative z-10 whitespace-pre-wrap lowercase">{summary}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
                {/* Left Stats */}
                <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1 px-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Net yield</p>
                            <p className="font-outfit text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                ${outcome.totalARR.toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-1 px-1 text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Margin</p>
                            <p className={`font-outfit text-2xl font-black tracking-tighter uppercase italic ${outcome.netMargin < 0.45 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                                {(outcome.netMargin * 100).toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Profitability Intensity</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white italic">${outcome.grossProfit.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-black dark:bg-white transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((outcome.grossProfit / (outcome.totalARR || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Net Contribution Yield</span>
                                <span className="text-xs font-black text-emerald-500 italic">${outcome.netContribution.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((outcome.netContribution / (outcome.totalARR || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Suggested Terms */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Deal Strategy</h3>
                    </div>
                    <div className="space-y-4">
                        {terms.map((term, idx) => (
                            <div key={idx} className="group p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 hover:border-black dark:hover:border-white transition-all duration-300">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors italic">
                                    {term}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-50 dark:border-slate-900 flex justify-between items-center opacity-40">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] italic">
                    GTM Systems / v2.0
                </p>
                <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default ResultsPanel;
