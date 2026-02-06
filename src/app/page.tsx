"use client";

import React, { useState } from 'react';
import PricingForm, { PricingFormData } from '@/components/PricingForm';
import ResultsPanel from '@/components/ResultsPanel';

const PRESETS: Record<'good' | 'borderline' | 'bad', PricingFormData> = {
    good: {
        seats: 800,
        basePricePerSeatPerMonth: 110,
        aiPackageType: "usage",
        aiUnitsPerMonth: 40000,
        aiPricePerUnit: 0.08,
        discountRate: 12,
        partner: false,
        partnerTakeRate: 0
    },
    borderline: {
        seats: 500,
        basePricePerSeatPerMonth: 120,
        aiPackageType: "usage",
        aiUnitsPerMonth: 80000,
        aiPricePerUnit: 0.06,
        discountRate: 28,
        partner: true,
        partnerTakeRate: 15
    },
    bad: {
        seats: 300,
        basePricePerSeatPerMonth: 120,
        aiPackageType: "usage",
        aiUnitsPerMonth: 100000,
        aiPricePerUnit: 0.05,
        discountRate: 40,
        partner: true,
        partnerTakeRate: 20
    },
};

export default function PricingDashboard() {
    const [formData, setFormData] = useState<PricingFormData>(PRESETS.good);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

    const handlePreset = (type: 'good' | 'borderline' | 'bad') => {
        setFormData(PRESETS[type]);
    };

    const triggerToast = (msg: string) => {
        setToast({ message: msg, visible: true });
        setTimeout(() => setToast({ message: '', visible: false }), 3000);
    };

    return (
        <div className="min-h-screen bg-[#fdfdfe] dark:bg-black text-[#020617] dark:text-[#f8fafc] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-slate-200 dark:bg-slate-900 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-slate-200 dark:bg-slate-900 rounded-full blur-[100px]" />
            </div>

            {/* Toast Notification */}
            {toast.visible && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-outfit text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {toast.message}
                    </div>
                </div>
            )}

            <main className="relative z-10 flex flex-col min-h-screen">
                {/* Navigation Bar */}
                <nav className="h-20 border-b border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-[1600px] mx-auto h-full px-6 lg:px-12 flex items-center justify-between">
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className="text-white dark:text-black font-black text-lg">A</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-outfit text-sm font-black uppercase tracking-widest leading-none">Guardrails</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">GTM Finance Platform</span>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#020617] dark:text-[#f8fafc] transition-colors cursor-pointer border-b-2 border-black dark:border-white pb-1">Assessment</span>
                            <span
                                onClick={() => triggerToast('Module Access Restricted / Historical Benchmarks')}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            >
                                Benchmarks
                            </span>
                            <span
                                onClick={() => triggerToast('Module Access Restricted / Global Policy Library')}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            >
                                Policy
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-900 mx-2" />
                            <div
                                onClick={() => triggerToast('Integration Active / Syncing to ERP')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/5 dark:shadow-white/5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest">Deploy</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Header */}
                <header className="py-16 md:py-24 px-6 lg:px-12">
                    <div className="max-w-[1600px] mx-auto">
                        <div className="max-w-4xl space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">v2.4 Production Node / FY26 Standard</span>
                            </div>

                            <h1 className="font-outfit text-6xl md:text-8xl font-black tracking-tighter-extra uppercase transition-all leading-[0.9]">
                                Deal Desk <br className="hidden md:block" />
                                <span className="relative inline-block mt-2">
                                    <span className="text-stroke-black dark:text-stroke-white text-transparent">Guardrails</span>
                                    <span className="absolute -top-1 -right-6 w-3 h-3 bg-black dark:bg-white rounded-full hidden md:block animate-pulse" />
                                </span>
                            </h1>

                            <p className="max-w-2xl text-slate-500 dark:text-slate-400 font-medium text-xl leading-relaxed italic tracking-tight opacity-80 pt-4">
                                advanced profitability systems & margin protection <br className="hidden md:block" /> for high-velocity enterprise gtm organizations.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 max-w-[1600px] mx-auto w-full p-6 lg:p-12 pt-0">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                        {/* Left Column */}
                        <div className="xl:col-span-5 flex flex-col gap-8">
                            <div className="bg-black text-white dark:bg-white dark:text-black p-5 rounded-3xl flex items-center justify-between group cursor-default shadow-xl shadow-black/5 dark:shadow-white/5">
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Terminal 01</p>
                                    <p className="font-outfit text-sm font-bold tracking-tight">Configuration Engine</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-white/20 dark:bg-black/20 rounded-full group-hover:bg-white dark:group-hover:bg-black transition-all duration-300" />
                                    <div className="w-1.5 h-1.5 bg-white/20 dark:bg-black/20 rounded-full group-hover:bg-white dark:group-hover:bg-black transition-all duration-300 delay-75" />
                                    <div className="w-1.5 h-1.5 bg-white/40 dark:bg-black/40 rounded-full group-hover:bg-white dark:group-hover:bg-black transition-all duration-300 delay-150" />
                                </div>
                            </div>
                            <PricingForm
                                formData={formData}
                                onChange={setFormData}
                                onPreset={handlePreset}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="xl:col-span-7">
                            <ResultsPanel data={formData} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-12 px-6 lg:px-12 mt-auto">
                    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border-t border-slate-100 dark:border-slate-900 pt-10">
                        <div className="flex gap-10">
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.4em] hover:text-black dark:hover:text-white transition-colors cursor-default">Compliance</span>
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.4em] hover:text-black dark:hover:text-white transition-colors cursor-default">Governance</span>
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.4em] hover:text-black dark:hover:text-white transition-colors cursor-default">Audit Log</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
