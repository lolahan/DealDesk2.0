'use client';

import React, { useEffect } from 'react';
import AppLayout from '@/components/Layout';
import { useStore } from '@/lib/store';
import DataEditor from '@/components/tabs/DataEditor';
import ROIDashboard from '@/components/tabs/ROIDashboard';
import DecisionRouter from '@/components/tabs/DecisionRouter';
import FinancialDataExplorer from '@/components/tabs/FinancialDataExplorer';

export default function Home() {
    const { activeTab, recalculate } = useStore();

    useEffect(() => {
        recalculate();
    }, [recalculate]);

    return (
        <AppLayout>
            {activeTab === 0 && <DataEditor />}
            {activeTab === 1 && <ROIDashboard />}
            {activeTab === 2 && <DecisionRouter />}
            {activeTab === 3 && <FinancialDataExplorer />}
        </AppLayout>
    );
}
