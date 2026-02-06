"use strict";

import React from 'react';

export interface PricingFormData {
  seats: number;
  basePricePerSeatPerMonth: number;
  aiPackageType: "usage";
  aiUnitsPerMonth: number;
  aiPricePerUnit: number;
  discountRate: number;
  partner: boolean;
  partnerTakeRate: number;
}

interface PricingFormProps {
  formData: PricingFormData;
  onChange: (data: PricingFormData) => void;
  onPreset: (type: 'good' | 'borderline' | 'bad') => void;
}

const PricingForm: React.FC<PricingFormProps> = ({ formData, onChange, onPreset }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    onChange({
      ...formData,
      [name]: type === 'checkbox' ? checked :
        (name === 'aiPackageType' ? value : parseFloat(value) || 0),
    });
  };

  const baseARR = formData.seats * formData.basePricePerSeatPerMonth * 12;
  const aiARR = formData.aiUnitsPerMonth * formData.aiPricePerUnit * 12;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[2.5rem] shadow-[0_12px_40px_rgb(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)] border border-slate-100 dark:border-slate-800/50 transition-all duration-500">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-1.5 h-8 bg-black dark:bg-white rounded-full" />
        <h2 className="font-outfit text-2xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
          Config Deal
        </h2>
      </div>

      <div className="flex gap-2 mb-12 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onPreset('good')}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-outfit text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500/10 transition-all cursor-pointer"
        >
          Good
        </button>
        <button
          onClick={() => onPreset('borderline')}
          className="flex-1 py-3 px-4 rounded-xl bg-amber-500/5 text-amber-600 dark:text-amber-400 font-outfit text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500/10 transition-all cursor-pointer"
        >
          Borderline
        </button>
        <button
          onClick={() => onPreset('bad')}
          className="flex-1 py-3 px-4 rounded-xl bg-rose-500/5 text-rose-600 dark:text-rose-400 font-outfit text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          Bad
        </button>
      </div>

      <div className="space-y-10">
        {/* Base Subscription Section */}
        <div className="group">
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Module 01 / Core Seats</h3>
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Base ARR: ${baseARR.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Capacity</label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Yield / Mo</label>
              <input
                type="number"
                name="basePricePerSeatPerMonth"
                value={formData.basePricePerSeatPerMonth}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* AI Package Section */}
        <div className="group">
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Module 02 / AI Compute</h3>
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">AI ARR: ${aiARR.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Units / Mo</label>
              <input
                type="number"
                name="aiUnitsPerMonth"
                value={formData.aiUnitsPerMonth}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Unit Rate ($)</label>
              <input
                type="number"
                name="aiPricePerUnit"
                value={formData.aiPricePerUnit}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Commercials Section */}
        <div className="pt-10 space-y-8 border-t border-slate-100 dark:border-slate-800/50">
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Deal Discount (%)</label>
              <span className="text-xl font-outfit font-black tracking-tighter italic">{formData.discountRate}%</span>
            </div>
            <input
              type="number"
              name="discountRate"
              value={formData.discountRate}
              onChange={handleChange}
              className="w-full px-6 py-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-black dark:bg-white text-white dark:text-black text-2xl font-outfit font-black tracking-tighter-extra italic focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 outline-none transition-all shadow-xl shadow-black/5"
            />
          </div>

          <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Partner Fulfillment</p>
              <p className="text-[10px] text-slate-400 font-medium italic">Apply indirect sales logic</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="partner"
                checked={formData.partner}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white dark:after:bg-black"></div>
            </label>
          </div>

          {formData.partner && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500 space-y-3">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-[0.3em]">Channel Incentive (%)</label>
              <input
                type="number"
                name="partnerTakeRate"
                value={formData.partnerTakeRate}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingForm;
