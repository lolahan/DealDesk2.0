'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
    LayoutDashboard,
    Database,
    Route,
    Search,
    Bell,
    User,
    ChevronRight,
    Settings,
    HelpCircle,
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
const navItems = [
    { id: 0, label: 'Data Editor', icon: Database },
    { id: 1, label: 'ROI Dashboard', icon: LayoutDashboard },
    { id: 2, label: 'Decision Router', icon: Route },
    { id: 3, label: 'Financial Explorer', icon: BarChart3 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { activeTab, setActiveTab } = useStore();

    return (
        <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden font-outfit">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-[#020617]/50 backdrop-blur-xl flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <Route className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">DealDesk <span className="text-emerald-500 text-xs font-mono uppercase bg-emerald-500/10 px-1 border border-emerald-500/20 rounded ml-1">AI</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">Core Control Layer</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-emerald-500" : "text-slate-500 group-hover:text-slate-400")} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="ml-auto w-1 h-4 bg-emerald-500 rounded-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 transition-colors text-sm">
                        <Settings className="w-4 h-4" />
                        <span>Platform Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 transition-colors text-sm">
                        <HelpCircle className="w-4 h-4" />
                        <span>Support Center</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-[#020617]/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="hover:text-slate-300 cursor-pointer transition-colors">Workspace</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-slate-200 font-medium">{navItems[activeTab].label}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                className="bg-slate-900/50 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-xs w-64 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative text-slate-500 hover:text-slate-300 transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 border-2 border-[#020617] rounded-full"></span>
                            </button>
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/20">
                                JD
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-[#020617] to-[#020617]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
