'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
    Search,
    Table as TableIcon,
    PieChart,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Activity,
    AlertCircle,
    CheckCircle2,
    Zap
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
    PieChart as RePieChart,
    Pie,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    ZAxis
} from 'recharts';

export default function FinancialDataExplorer() {
    const { financialData, explorationResult, runExploration } = useStore();
    const [query, setQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [manualChartType, setManualChartType] = useState<'bar' | 'pie' | 'line' | 'scatter' | null>(null);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setIsAnalyzing(true);
        setTimeout(() => {
            runExploration(query);
            setManualChartType(null); // Reset when new search runs
            setIsAnalyzing(false);
        }, 800);
    };

    // Initial load
    useEffect(() => {
        if (!explorationResult) {
            runExploration('');
        }
    }, [explorationResult, runExploration]);

    const activeChartType = manualChartType || explorationResult?.chartType || 'bar';

    const renderChart = () => {
        if (!explorationResult) return null;

        const { chartData } = explorationResult;

        if (activeChartType === 'pie') {
            const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                            data={chartData}
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </RePieChart>
                </ResponsiveContainer>
            );
        }

        if (activeChartType === 'scatter') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis type="number" dataKey="cost" name="Cost" stroke="#94a3b8" />
                        <YAxis type="number" dataKey="profit" name="Profit" stroke="#94a3b8" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Projects" data={chartData} fill="#ef4444" />
                    </ScatterChart>
                </ResponsiveContainer>
            );
        }

        if (activeChartType === 'line') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none' }} />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Top: Search Area */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Financial Data Explorer</h2>
                        <p className="text-slate-500 text-xs">Analyze post-period data using natural language.</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'Compare ByrnSil vs Kopix revenue' or 'Show profit share by division'"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-32 text-lg text-slate-900 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {isAnalyzing ? 'Processing...' : 'Explore'}
                        {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Middle: Raw Data Table */}
                <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-3xl flex flex-col shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <TableIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Transactional Data Layer</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white shadow-sm z-10">
                                <tr>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">ID</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Company</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Division</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Project</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Revenue</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialData?.map((record) => {
                                    const isHighlighted = explorationResult?.highlightedRowIds?.includes(record.id);
                                    return (
                                        <tr
                                            key={record.id}
                                            className={`transition-colors duration-500 border-b border-slate-50 ${isHighlighted ? 'bg-amber-50/80 shadow-[inset_4px_0_0_#f59e0b]' : 'hover:bg-slate-50'}`}
                                        >
                                            <td className={`p-4 font-mono text-xs ${isHighlighted ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>{record.id}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${record.company === 'ByrnSil' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {record.company}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">{record.division}</td>
                                            <td className="p-4 text-sm font-medium text-slate-900">{record.project}</td>
                                            <td className="p-4 text-sm font-mono text-slate-600 text-right">€{record.revenue.toLocaleString()}</td>
                                            <td className={`p-4 text-sm font-mono text-right font-bold ${record.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                €{record.profit.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Visualization & Deep Insights */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 flex flex-col min-h-[500px] shadow-2xl relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none" />
                        <div className="flex items-center justify-between mb-8 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <PieChart className="w-6 h-6 text-indigo-400" />
                                    AI Structural Analysis
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Dynamic Exploration Layer</p>
                            </div>
                            <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
                                {(['bar', 'pie', 'line', 'scatter'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setManualChartType(type)}
                                        className={`p-1.5 rounded-lg transition-all ${activeChartType === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        <Activity className="w-3.5 h-3.5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 z-10 py-4">
                            {renderChart()}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <Activity className="text-indigo-600 w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900">Deep Financial Insights</h3>
                        </div>

                        <AnimatePresence mode="wait">
                            {explorationResult ? (
                                <motion.div
                                    key={explorationResult.summary}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                        <p className="text-sm text-indigo-900 leading-relaxed font-bold">
                                            "{explorationResult.summary}"
                                        </p>
                                    </div>

                                    <div className="grid gap-3">
                                        {explorationResult?.deepInsights?.map((insight, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 border border-slate-100 hover:border-indigo-200 rounded-2xl transition-colors bg-slate-50/30">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                                                    <span className="text-[10px] font-bold text-indigo-600">{idx + 1}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                    {insight}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {explorationResult.horizontalComparison && (
                                        <div className="mt-6 pt-6 border-t border-slate-100">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Horizontal Comparison: {explorationResult.horizontalComparison.metric}</span>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="text-[10px] text-slate-500 font-bold block mb-1">ByrnSil</span>
                                                    <span className="text-lg font-mono font-bold text-indigo-600">
                                                        {explorationResult.horizontalComparison.byrnSilValue > 1000
                                                            ? `€${(explorationResult.horizontalComparison.byrnSilValue / 1000).toFixed(1)}k`
                                                            : `${explorationResult.horizontalComparison.byrnSilValue.toFixed(1)}%`}
                                                    </span>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Kopix</span>
                                                    <span className="text-lg font-mono font-bold text-emerald-600">
                                                        {explorationResult.horizontalComparison.kopixValue > 1000
                                                            ? `€${(explorationResult.horizontalComparison.kopixValue / 1000).toFixed(1)}k`
                                                            : `${explorationResult.horizontalComparison.kopixValue.toFixed(1)}%`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
                                    <Activity className="w-12 h-12 mb-4" />
                                    <p className="text-sm italic text-center px-8">Ready for deep-dive analysis. Query the data to reveal latent structural insights.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
