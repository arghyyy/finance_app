import React, { useState, useEffect } from 'react';
import { emergencyFundApi, goalsApi } from '../services/api';

export default function EmergencyFundPage({ goal, onTopUpSuccess }: { goal?: any, onTopUpSuccess?: () => void }) {
  const [fund, setFund] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [targetMonths, setTargetMonths] = useState(6);
  const [monthlyNeeds, setMonthlyNeeds] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  const fetchFund = async () => {
    try {
      const { data } = await emergencyFundApi.get();
      setFund(data);
      setTargetMonths(data.target_months);
      setMonthlyNeeds(data.monthly_needs ? data.monthly_needs.toString() : '');
    } catch (e) {
      console.error("Failed to fetch emergency fund", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!goal || goal.category === 'dana_darurat') {
      fetchFund();
    } else {
      setLoading(false);
    }
  }, [goal]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await emergencyFundApi.update({
        target_months: targetMonths,
        monthly_needs: Number(monthlyNeeds.replace(/[^0-9.-]+/g, ""))
      });
      alert('Settings saved!');
      fetchFund();
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topUpAmount.replace(/[^0-9.-]+/g, ""));
    if (amount <= 0) return;
    try {
      if (goal && goal.category !== 'dana_darurat') {
        await goalsApi.topUp(goal.id, amount);
      } else {
        await emergencyFundApi.topUp(amount);
      }
      alert('Top-up successful!');
      setTopUpAmount('');
      if (!goal || goal.category === 'dana_darurat') {
        fetchFund();
      }
      if (onTopUpSuccess) {
        onTopUpSuccess();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to top up');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant font-body-md">Loading {goal && goal.category !== 'dana_darurat' ? 'Goal Details' : 'Emergency Fund'}...</div>;
  }

  return (
    <div className="space-y-xl max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">{goal ? goal.name : 'Emergency Fund'}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {goal && goal.category !== 'dana_darurat' ? `Track your progress and stay consistent for ${goal.name}.` : 'Secure your future against unexpected events.'}
          </p>
        </div>
      </div>
      
      {(() => {
        const currentAmount = goal ? goal.currentAmount : (fund?.current_amount || 0);
        const targetAmount = goal ? goal.targetAmount : (fund?.target_amount || 0);
        const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;
        const topUp = goal ? goal.monthlyContrib : (fund?.monthly_top_up || 0);
        const remaining = Math.max(0, targetAmount - currentAmount);
        const estimatedMonths = topUp > 0 ? Math.ceil(remaining / topUp) : 0;
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Current Balance</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-[36px] font-bold text-primary">Rp {currentAmount.toLocaleString('id-ID')}</span>
              <span className="text-on-surface-variant mb-2">of Rp {targetAmount.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="relative h-3 bg-surface-container-high rounded-full overflow-hidden mb-2">
              <div 
                className="absolute top-0 left-0 h-full rounded-full bg-primary" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Progress: {progressPercent}%</span>
              <span>Target: {goal ? goal.timeline : fund?.target_months} Months</span>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="bg-surface-container p-4 rounded-lg">
              <p className="text-sm text-on-surface-variant mb-1">Estimated Completion</p>
              <p className="font-semibold text-on-surface">{estimatedMonths} Months</p>
            </div>
            <div className="bg-surface-container p-4 rounded-lg">
              <p className="text-sm text-on-surface-variant mb-1">Monthly Top Up</p>
              <p className="font-semibold text-on-surface">Rp {topUp.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Top Up Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">add_circle</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Quick Top-Up</h3>
          </div>
          <form onSubmit={handleTopUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">Rp</span>
                <input
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="0"
                  type="text"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#10b981] hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-opacity"
            >
              Top Up
            </button>
          </form>
        </div>
      </div>
        );
      })()}
      
      {/* Settings Section (Hidden if tracking a specific Goal since target is fixed) */}
      {!goal && (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm mt-8">
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">settings</span>
          Fund Settings
        </h3>
        
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Target Months</label>
            <div className="relative">
              <select
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months (Recommended)</option>
                <option value={9}>9 Months</option>
                <option value={12}>12 Months</option>
                <option value={24}>24 Months</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Monthly Living Needs</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">Rp</span>
              <input
                value={monthlyNeeds}
                onChange={(e) => setMonthlyNeeds(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="10000000"
                type="text"
                required
              />
            </div>
          </div>
          
          <div className="md:col-span-2 flex justify-end pt-4 border-t border-outline-variant/50">
            <button
              type="submit"
              className="bg-[#10b981] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-opacity shadow-sm"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
