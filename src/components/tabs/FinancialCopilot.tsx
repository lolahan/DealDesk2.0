'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
    Search,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    ArrowRight,
    Zap,
    Info,
    MessageSquare,
    Target,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ScatterChart,
    Scatter,
    ZAxis,
    LineChart,
    Line
} from 'recharts';
import { parseFinancialQuery, runFinancialAnalysis, AnalysisResult } from '@/lib/analyticEngine';

export default function FinancialCopilot() {
    const { cleanedCampaigns, decisions, setActiveTab, setSelectedCampaignId } = useStore();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setIsAnalyzing(true);
        setTimeout(() => {
            const intent = parseFinancialQuery(query);
            const analysis = runFinancialAnalysis(intent, cleanedCampaigns, decisions);
            setResult(analysis);
            setIsAnalyzing(false);
        }, 800);
    };

    // Initial analysis
    useEffect(() => {
        if (!result) {
            const analysis = runFinancialAnalysis('GENERAL', cleanedCampaigns, decisions);
            setResult(analysis);
        }
    }, []);

    const renderChart = () => {
        if (!result || result.chartData.length === 0) return null;

        if (result.chartType === 'bar') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1e293b' }}
                            formatter={(val: any) => [`${Number(val).toFixed(2)}`, 'Value']}
                        />
                        <Bar dataKey={Object.keys(result.chartData[0]).find(k => k !== 'name') || ''} radius={[4, 4, 0, 0]}>
                            {result.chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.roi < 1 ? '#f43f5e' : '#10b981'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        if (result.chartType === 'scatter') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" dataKey="cost" name="Cost" stroke="#64748b" fontSize={10} unit="€" />
                        <YAxis type="number" dataKey="roi" name="ROI" stroke="#64748b" fontSize={10} unit="x" />
                        <ZAxis type="number" range={[100, 500]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', color: '#1e293b' }} />
                        <Scatter name="Campaigns" data={result.chartData} fill="#8884d8">
                            {result.chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.roi < 1 ? '#f43f5e' : '#10b981'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header: AI Query Panel */}
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Review Copilot</h2>
                        <p className="text-slate-500 text-sm">AI-driven post-period performance analysis & structural auditing.</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about performance, e.g., 'Which projects dragged profit?' or 'Analyze channel performance'"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-32 text-lg text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
                        {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Left: AI Highlighted Findings & Recommendations */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 flex flex-col shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-rose-500" />
                                AI Highlighted Findings
                            </h3>
                            {result && (
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                                    {result.insights.length} Insights Identified
                                </span>
                            )}
                        </div>

                        {result && result.insights.length > 0 ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl mb-6">
                                    <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                                        "{result.summary}"
                                    </p>
                                </div>
                                {result.insights.map((insight, idx) => (
                                    <motion.div
                                        key={insight.id + idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all hover:shadow-md cursor-pointer"
                                        onClick={() => {
                                            if (insight.campaignId) {
                                                setSelectedCampaignId(insight.campaignId);
                                                setActiveTab(2); // Jump to Router
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{insight.title}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${insight.type === 'negative' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {insight.impact}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{insight.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
                                <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-slate-400 text-sm">Awaiting instructions...</p>
                            </div>
                        )}
                    </div>

                    {/* Recommendations Integration below findings */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Target className="text-emerald-600 w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900">Strategic Recommendation</h3>
                        </div>

                        {result ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-4 h-4 text-emerald-600 mt-0.5" />
                                        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                                            {result.recommendation}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => alert('Strategic recommendation applied to next cycle rules.')}
                                    className="w-full flex items-center justify-center gap-3 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg border border-slate-800 text-xs"
                                >
                                    <Zap className="w-3 h-3 text-amber-400" />
                                    Apply to next cycle
                                    <ChevronRight className="w-3 h-3 ml-2" />
                                </button>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs italic">
                                Run analysis to see recommendations.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Auto-generated Viz (MAKING IT MUCH LARGER) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
                    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 flex flex-col h-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none" />
                        <div className="flex items-center justify-between mb-8 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-indigo-400" />
                                    AI Structural Analysis
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Auto-suggested Dynamic Visualization</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 z-10">
                            {renderChart()}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center z-10">
                            <div className="text-xs text-slate-400 font-medium">
                                Data Source: All Historical Conversion Logs
                            </div>
                            <div className="text-[10px] text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest">
                                Intent: {result?.intent || 'GENERAL'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
