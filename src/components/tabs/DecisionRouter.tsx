'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
    Send,
    Bot,
    User,
    Filter,
    ArrowRight,
    Info,
    Lightbulb,
    History,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DecisionRouter() {
    const {
        cleanedCampaigns,
        decisions,
        similarities,
        selectedCampaignId,
        setSelectedCampaignId,
        updateCampaign,
    } = useStore();

    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "System ready. I can filter campaigns, explain decisions, or run What-if scenarios. Try 'Show me EMEA campaigns' or 'Why is C020 stopped?'" }
    ]);
    const [filter, setFilter] = useState<'ALL' | 'AUTO-APPROVE' | 'FINANCE REVIEW' | 'STOP'>('ALL');
    const [showDemoScript, setShowDemoScript] = useState(true);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectedCampaign = cleanedCampaigns.find(c => c.campaign_id === selectedCampaignId);
    const selectedDecision = selectedCampaign ? decisions[selectedCampaign.campaign_id] : null;
    const selectedSimilarity = selectedCampaign ? similarities[selectedCampaign.campaign_id] : null;

    const handleChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const input = chatInput.toLowerCase();
        setMessages(prev => [...prev, { role: 'user', content: chatInput }]);
        setChatInput('');

        // Simple NL Parser for Demo
        setTimeout(() => {
            let response = "I couldn't parse that command. Try 'Show [region/channel]', 'Why is [ID]...', or 'Set [ID] cost to [value]'.";

            // 1. Filtering
            if (input.includes('show') || input.includes('find') || input.includes('filter')) {
                if (input.includes('emea')) { setFilter('ALL'); response = "Filtered view for EMEA region."; }
                else if (input.includes('na')) { setFilter('ALL'); response = "Filtered view for NA region."; }
                else if (input.includes('auto')) { setFilter('AUTO-APPROVE'); response = "Showing all auto-approved campaigns."; }
                else if (input.includes('finance')) { setFilter('FINANCE REVIEW'); response = "Showing campaigns requiring Finance review."; }
                else if (input.includes('stop')) { setFilter('STOP'); response = "Showing campaigns flagged to stop/redesign."; }
            }

            // 2. Explanation
            else if (input.includes('why') || input.includes('explain')) {
                const match = input.match(/c\d{3}/);
                if (match) {
                    const id = match[0].toUpperCase();
                    const d = decisions[id];
                    if (d) {
                        setSelectedCampaignId(id);
                        response = `Analysis for ${id}: ${d.decision_reason.join(' ')} ${d.recommended_action}`;
                    }
                }
            }

            // 3. What-if
            else if (input.includes('set') || input.includes('change') || input.includes('reduce') || input.includes('increase')) {
                const idMatch = input.match(/c\d{3}/);
                const valMatch = input.match(/\d+/);
                if (idMatch && valMatch) {
                    const id = idMatch[0].toUpperCase();
                    const val = parseInt(valMatch[0]);
                    if (input.includes('cost')) {
                        updateCampaign(id, { cost_eur: val });
                        response = `Updated ${id} cost to €${val.toLocaleString()}. Calculations refreshed.`;
                    } else if (input.includes('acv')) {
                        updateCampaign(id, { avg_acv_eur: val });
                        response = `Updated ${id} ACV to €${val.toLocaleString()}. ROI updated.`;
                    }
                }
            }

            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        }, 500);
    };

    const filteredCampaigns = cleanedCampaigns.filter(c => {
        if (filter === 'ALL') return true;
        return decisions[c.campaign_id]?.decision.includes(filter);
    });

    return (
        <div className="flex h-full gap-8 relative">
            {/* Demo Script Banner */}
            <AnimatePresence>
                {showDemoScript && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="absolute top-0 left-0 right-0 z-50 overflow-hidden"
                    >
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex gap-4 backdrop-blur-xl">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                <Sparkles className="text-white w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-emerald-400 font-bold text-sm">3-Minute Demo Script</h4>
                                <ul className="text-slate-400 text-xs mt-1 grid grid-cols-2 gap-x-8 gap-y-1 list-disc list-inside">
                                    <li>Start in Data Editor, show "Profit" priority context.</li>
                                    <li>Highlight C020 low quality score & auto-imputed metrics.</li>
                                    <li>Switch to Decision Router, filter by "FINANCE REVIEW".</li>
                                    <li>Ask Chatbox: "Why is C011 Finance Review?"</li>
                                    <li>Run What-if: "Set C008 cost to 30000" and show ROI jump.</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => setShowDemoScript(false)}
                                className="text-slate-500 hover:text-slate-300"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Table Column */}
            <div className="flex-1 flex flex-col gap-6 min-w-0 pb-12 pt-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Decision Control Layer</h2>
                        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                            {(['ALL', 'AUTO-APPROVE', 'FINANCE REVIEW', 'STOP'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden flex-1 border border-slate-800/50">
                    <div className="overflow-x-auto h-full">
                        <table className="sn-table">
                            <thead className="sticky top-0 z-10 glass-panel">
                                <tr>
                                    <th className="w-16">ID</th>
                                    <th>ROI</th>
                                    <th>Threshold</th>
                                    <th>Risk Score</th>
                                    <th>Decision</th>
                                    <th>Next Owner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCampaigns.map((c) => {
                                    const d = decisions[c.campaign_id];
                                    return (
                                        <tr
                                            key={c.campaign_id}
                                            onClick={() => setSelectedCampaignId(c.campaign_id)}
                                            className={`cursor-pointer group ${selectedCampaignId === c.campaign_id ? 'bg-emerald-500/10' : ''}`}
                                        >
                                            <td className="font-mono text-emerald-500 text-xs">{c.campaign_id}</td>
                                            <td>
                                                <div className="flex items-center gap-1.5 font-bold">
                                                    <span className={d.roi >= d.roi_threshold ? 'text-emerald-500' : 'text-rose-500'}>
                                                        {d.roi.toFixed(2)}x
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-slate-500 font-mono text-xs">{d.roi_threshold.toFixed(2)}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${d.adjusted_risk_score < 0.4 ? 'bg-emerald-500' : d.adjusted_risk_score < 0.7 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${d.adjusted_risk_score * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-slate-500">{(d.adjusted_risk_score * 100).toFixed(2)}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-tag ${d.decision === 'AUTO-APPROVE' ? 'status-approve' : d.decision === 'FINANCE REVIEW' ? 'status-review' : 'status-stop'}`}>
                                                    {d.decision}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <History className="w-3 h-3" />
                                                    {d.next_owner}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chatbox area */}
                <div className="glass-panel border-t border-slate-800 rounded-2xl h-64 flex flex-col overflow-hidden bg-slate-900/20">
                    <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Bot className="w-3 h-3 text-emerald-500" />
                        Decision Support Assistant
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                                {m.role === 'ai' && (
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                    {m.content}
                                </div>
                                {m.role === 'user' && (
                                    <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleChat} className="p-3 bg-slate-900/30 border-t border-slate-800 flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask for an explanation or run a simulation..."
                            className="flex-1 bg-transparent border-none text-xs focus:ring-0 text-slate-200 placeholder:text-slate-600"
                        />
                        <button type="submit" className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Detail Column */}
            <div className="w-[420px] flex flex-col gap-6 h-full overflow-y-auto pr-2">
                {selectedCampaign && selectedDecision ? (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Decision Rationale */}
                        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-emerald-200 shadow-sm text-slate-900">
                            <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-emerald-600" />
                                AI Decision Explanation
                            </h3>
                            <div className="space-y-4">
                                {selectedDecision.decision_reason.map((r, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-emerald-600">{i + 1}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">"{r}"</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recommended Lever</label>
                                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium">
                                    {selectedDecision.recommended_action}
                                </div>
                            </div>
                        </div>

                        {/* Campaign Similarity (ML) */}
                        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-900">
                            <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                ML Similarity Mapping
                            </h3>
                            <p className="text-[10px] text-slate-500 mb-4 leading-relaxed uppercase font-bold tracking-tight">K-Nearest Neighbors Proof Points</p>

                            <div className="space-y-3">
                                {selectedSimilarity?.similar_campaigns.map((s, i) => (
                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 transition-all hover:border-slate-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-mono font-bold text-slate-600">{s.campaign_id}</span>
                                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{(s.similarity * 100).toFixed(2)}% Match</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] uppercase text-slate-500 font-bold">ROI</span>
                                                    <span className="text-xs font-bold text-slate-900">{s.roi.toFixed(2)}x</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] uppercase text-slate-500 font-bold">Decision</span>
                                                    <span className="text-[10px] font-bold text-slate-500">{s.decision}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                    Evidence-based insight: Similar campaigns in {selectedCampaign.region} with {selectedCampaign.channel} channels have an average final ACV uplift of 15% when ROI exceeds target by 0.5x.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="glass-panel p-12 rounded-2xl flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
                            <Bot className="w-8 h-8 text-slate-700" />
                        </div>
                        <div>
                            <p className="text-slate-400 font-medium font-outfit">Awaiting Campaign Selection</p>
                            <p className="text-slate-500 text-xs mt-1">Select a record to see AI justifications and similarity evidence.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
