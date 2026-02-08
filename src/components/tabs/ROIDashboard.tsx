'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    ZAxis,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import {
    TrendingUp,
    Target,
    ShieldCheck,
    Coins,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ROIDashboard() {
    const { cleanedCampaigns, decisions } = useStore();

    const totalCost = cleanedCampaigns.reduce((acc, c) => acc + c.cost_eur, 0);
    const totalACV = cleanedCampaigns.reduce((acc, c) => {
        const d = decisions[c.campaign_id];
        return acc + (c.opps_created * c.win_rate * c.avg_acv_eur);
    }, 0);

    const avgROI = totalCost > 0 ? totalACV / totalCost : 0;

    const autoApprovedCount = Object.values(decisions).filter(d => d.decision === 'AUTO-APPROVE').length;
    const autoApproveRate = (autoApprovedCount / cleanedCampaigns.length) * 100;

    const scatterData = cleanedCampaigns.map(c => ({
        name: c.campaign_name,
        cost: c.cost_eur,
        roi: decisions[c.campaign_id]?.roi || 0,
        risk: decisions[c.campaign_id]?.adjusted_risk_score || 0,
    }));

    const rankingData = cleanedCampaigns
        .map(c => ({
            id: c.campaign_id,
            name: c.campaign_name,
            roi: decisions[c.campaign_id]?.roi || 0,
        }))
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 8);

    const regionData = ['EMEA', 'NA', 'APAC'].map(region => {
        const regionCampaigns = cleanedCampaigns.filter(c => c.region === region);
        const avgRisk = regionCampaigns.reduce((acc, c) => acc + (decisions[c.campaign_id]?.adjusted_risk_score || 0), 0) / (regionCampaigns.length || 1);
        const totalRegionACV = regionCampaigns.reduce((acc, c) => acc + (c.opps_created * c.win_rate * c.avg_acv_eur), 0);
        return { name: region, risk: avgRisk, acv: totalRegionACV };
    });

    return (
        <div className="space-y-8 pb-12">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Investment', value: `€${(totalCost / 1e6).toFixed(2)}M`, icon: Coins, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Estimated ACV', value: `€${(totalACV / 1e6).toFixed(2)}M`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Weighted Avg ROI', value: `${avgROI.toFixed(2)}x`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-100' },
                    { label: 'Auto-Approval', value: `${autoApproveRate.toFixed(2)}%`, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
                ].map((kpi, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`${kpi.bg} p-2.5 rounded-xl`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{kpi.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ROI vs Cost Scatter Plot */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white font-bold">ROI Efficiency vs Investment</h3>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Low Risk</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> High Risk</div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <XAxis
                                    type="number"
                                    dataKey="cost"
                                    name="Cost"
                                    unit="€"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickFormatter={(val) => `${val / 1000}k`}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="roi"
                                    name="ROI"
                                    stroke="#475569"
                                    fontSize={10}
                                />
                                <ZAxis type="number" dataKey="risk" range={[50, 400]} />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        color: '#1e293b'
                                    }}
                                    itemStyle={{ color: '#475569', padding: '2px 0' }}
                                    labelStyle={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '4px' }}
                                    formatter={(value: any, name?: string) => {
                                        const cleanName = name?.toLowerCase() || '';
                                        if (cleanName.includes('cost') || cleanName.includes('investment')) return [`€${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Investment'];
                                        if (cleanName.includes('roi')) return [`${Number(value).toFixed(2)}x`, 'ROI'];
                                        if (cleanName.includes('risk')) return [`${(Number(value) * 100).toFixed(2)}%`, 'Risk Score'];
                                        return [value, name || ''];
                                    }}
                                />
                                <Scatter data={scatterData}>
                                    {scatterData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.risk > 0.6 ? '#f43f5e' : entry.risk > 0.4 ? '#fbbf24' : '#10b981'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ROI Ranking Bar Chart */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]">
                    <h3 className="text-white font-bold mb-6">Top Campaign Performance (ROI)</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rankingData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="id"
                                    type="category"
                                    stroke="#475569"
                                    fontSize={10}
                                    width={40}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        color: '#1e293b'
                                    }}
                                    formatter={(value: any) => [`${Number(value).toFixed(2)}x`, 'ROI']}
                                />
                                <Bar dataKey="roi" radius={[0, 4, 4, 0]} barSize={20}>
                                    {rankingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#1e293b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Region Risk Assessment */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-white font-bold mb-6 text-center">Regional Portfolio Risk Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {regionData.map((region, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Risk', value: region.risk },
                                                { name: 'Stability', value: 1 - region.risk }
                                            ]}
                                            innerRadius={45}
                                            outerRadius={60}
                                            startAngle={90}
                                            endAngle={450}
                                            dataKey="value"
                                        >
                                            <Cell fill={region.risk > 0.5 ? '#f43f5e' : '#10b981'} />
                                            <Cell fill="#1e293b" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-sm font-bold text-white">{Math.round(region.risk * 100)}%</span>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">Risk</span>
                                </div>
                            </div>
                            <h4 className="mt-4 font-bold text-slate-200">{region.name}</h4>
                            <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">€{(region.acv / 1e3).toFixed(2)}k Est. ACV</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
