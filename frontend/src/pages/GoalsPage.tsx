import React, { useState, useEffect } from 'react';

import { goalsApi } from '../services/api';
import EmergencyFundPage from './EmergencyFundPage';

/* ─── Goal categories ─── */
const CATEGORIES = [
  { id: 'dana_darurat', label: 'Dana Darurat', icon: 'health_and_safety' },
  { id: 'menikah', label: 'Menikah', icon: 'favorite' },
  { id: 'membeli_mobil', label: 'Membeli Mobil', icon: 'directions_car' },
  { id: 'travelling', label: 'Travelling', icon: 'flight_takeoff' },
  { id: 'dana_pensiun', label: 'Dana Pensiun', icon: 'beach_access' },
  { id: 'pendidikan_anak', label: 'Dana Pendidikan Anak', icon: 'school' },
];

const EMERGENCY_FUND_ID = 'emergency_fund';

const getTargetDate = (months: number) => {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(today.getDate(), lastDay));

  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRemainingMonths = (targetDate?: string) => {
  if (!targetDate) return 24;

  const [year, month, day] = targetDate.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  const monthsRemaining = (target.getFullYear() - today.getFullYear()) * 12
    + target.getMonth() - today.getMonth();
  return Math.max(1, monthsRemaining);
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [originalTargetDate, setOriginalTargetDate] = useState<string | null>(null);
  const [originalTimeline, setOriginalTimeline] = useState(24);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [timeline, setTimeline] = useState(24); // months
  const [monthlyContrib, setMonthlyContrib] = useState('500000');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchGoals = async () => {
    try {
      const { data } = await goalsApi.list();
      const mapped = data.map((g: any) => {
        const timelineMonths = getRemainingMonths(g.target_date);
        return {
          id: g.id,
          name: g.label,
          category: g.goal_type,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount,
          targetDate: g.target_date,
          timeline: timelineMonths,
          monthlyContrib: timelineMonths > 0 ? (g.target_amount - g.current_amount) / timelineMonths : 0
        };
      });
      setGoals(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const resetGoalForm = () => {
    setName('');
    setCategory('');
    setTargetAmount('');
    setTimeline(24);
    setMonthlyContrib('500000');
    setEditingGoalId(null);
    setOriginalTargetDate(null);
    setOriginalTimeline(24);
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetGoalForm();
    setIsCreating(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, goal: any) => {
    e.stopPropagation();
    setEditingGoalId(goal.id);
    setName(goal.name);
    setCategory(goal.category);
    setTargetAmount(String(Math.round(Number(goal.targetAmount || 0))));
    setTimeline(goal.timeline);
    setOriginalTimeline(goal.timeline);
    setOriginalTargetDate(goal.targetDate);
    setMonthlyContrib(String(Math.round(Number(goal.monthlyContrib || 0))));
    setFormError('');
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    resetGoalForm();
  };

  const handleSaveGoal = async () => {
    const parsedTargetAmount = Number(targetAmount);
    if (!name.trim()) {
      setFormError('Goal name is required.');
      return;
    }
    if (!Number.isFinite(parsedTargetAmount) || parsedTargetAmount <= 0) {
      setFormError('Target amount must be greater than zero.');
      return;
    }
    if (!Number.isInteger(timeline) || timeline < 1 || timeline > 120) {
      setFormError('Target timeline must be between 1 and 120 months.');
      return;
    }

    setFormError('');
    setIsSaving(true);
    try {
      const goalData = {
        label: name.trim(),
        target_amount: parsedTargetAmount,
        target_date: editingGoalId && timeline === originalTimeline && originalTargetDate
          ? originalTargetDate
          : getTargetDate(timeline),
      };

      if (editingGoalId) {
        await goalsApi.update(editingGoalId, goalData);
      } else {
        await goalsApi.create({
          goal_type: category || 'savings',
          ...goalData,
          priority: 1
        });
      }

      await fetchGoals();
      setIsCreating(false);
      resetGoalForm();
    } catch (e) {
      console.error(e);
      setFormError(`Failed to ${editingGoalId ? 'update' : 'save'} goal. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await goalsApi.delete(id);
      if (selectedGoalId === id) setSelectedGoalId(null);
      fetchGoals();
    } catch (err) {
      console.error(err);
      alert('Failed to delete goal');
    }
  };

  /* ─── Goal detail view ─── */
  if (selectedGoalId) {
    const goal = goals.find(g => g.id === selectedGoalId);
    if (goal) {
      return (
        <div className="space-y-4 w-full">
          <button 
            onClick={() => setSelectedGoalId(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium mb-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Goals
          </button>
          <EmergencyFundPage goal={goal} onTopUpSuccess={fetchGoals} />
        </div>
      );
    }
  }

  /* ─── Goal list view (when data exists) ─── */
  if (goals.length > 0 && !isCreating) {
    return (
      <div className="space-y-xl max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">Financial Goals</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Define, track, and achieve your financial milestones.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-xs px-lg py-3 bg-[#10b981] text-white rounded-lg font-bold hover:opacity-90 transition-opacity active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Add Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((g) => (
            <div 
              key={g.id} 
              onClick={() => setSelectedGoalId(g.id)}
              className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#1a1a1a]">{CATEGORIES.find(c => c.id === g.category)?.icon || 'flag'}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold tracking-wider uppercase">
                    {CATEGORIES.find(c => c.id === g.category)?.label || 'Goal'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEdit(e, g)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#10b981] hover:bg-emerald-50 transition-colors"
                    title="Edit Goal"
                    aria-label={`Edit ${g.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteGoal(e, g.id)} 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Goal"
                    aria-label={`Delete ${g.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
              <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-1">{g.name}</h3>
              <p className="text-[13px] text-gray-500 mb-6">{g.timeline} Months Target</p>

              <div className="mb-2 flex justify-between items-end">
                <span className="text-[24px] font-bold text-[#1a1a1a]">Rp {Number(g.currentAmount || 0).toLocaleString('id-ID')}</span>
                <span className="text-[14px] font-semibold text-gray-400">of Rp {Number(g.targetAmount).toLocaleString('id-ID')}</span>
              </div>

              <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="absolute top-0 left-0 h-full rounded-full bg-[#10b981]" style={{ width: `${Math.min(100, (Number(g.currentAmount || 0) / Number(g.targetAmount)) * 100)}%` }} />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[12px] text-gray-500 font-medium">Monthly Contrib.</span>
                <span className="text-[14px] font-bold text-[#1a1a1a]">Rp {Number(g.monthlyContrib).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Empty state: Goal creation wizard ─── */
  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-xl flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-semibold text-on-surface mb-xs">
            {editingGoalId ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {editingGoalId ? 'Update the goal name, target amount, or target timeline.' : 'Define your objective and set a realistic timeline.'}
          </p>
        </div>
        {goals.length > 0 && (
          <button
            onClick={handleCloseForm}
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Wizard Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#E2E8F0] flex flex-col lg:flex-row overflow-hidden flex-1 min-h-[720px]">
        {/* ── Left Panel: Form ── */}
        <div className="w-full lg:w-3/5 p-lg md:p-xl flex flex-col">
          {/* Stepper */}
          <div className="flex items-center gap-sm mb-xl">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Step {step} of 3
            </span>
            <div className="flex gap-xs flex-1 max-w-[120px]">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-surface-container-high'}`}
                />
              ))}
            </div>
          </div>

          <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-lg">Goal Identification</h3>

          <form className="flex-1 flex flex-col gap-lg" onSubmit={(e) => e.preventDefault()}>
            {/* Goal Name */}
            <div>
              <label className="block font-body-sm text-body-sm font-medium text-on-surface mb-xs">Goal Name</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError('');
                }}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
                placeholder="e.g., Emergency Fund"
                type="text"
              />
            </div>

            {/* Goal Category */}
            <div>
              <label className="block font-body-sm text-body-sm font-medium text-on-surface mb-xs">Goal Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={Boolean(editingGoalId)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer disabled:bg-surface-container-low disabled:cursor-not-allowed disabled:text-on-surface-variant"
                >
                  <option disabled value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block font-body-sm text-body-sm font-medium text-on-surface mb-xs">Target Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant">Rp</span>
                <input
                  value={targetAmount}
                  onChange={(e) => {
                    setTargetAmount(e.target.value.replace(/\D/g, ''));
                    setFormError('');
                  }}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-12 pr-4 py-3 font-data-tabular text-data-tabular focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="10000000"
                  type="text"
                />
              </div>
            </div>

            {/* Target Timeline Slider */}
            <div>
              <div className="flex justify-between items-end mb-xs">
                <label className="block font-body-sm text-body-sm font-medium text-on-surface">Target Timeline</label>
                <span className="font-data-tabular text-data-tabular text-primary font-semibold">{timeline} Months</span>
              </div>
              <input
                value={timeline}
                onChange={(e) => {
                  setTimeline(Number(e.target.value));
                  setFormError('');
                }}
                className="w-full"
                max="120"
                min="1"
                type="range"
              />
              <div className="flex justify-between mt-sm text-on-surface-variant font-label-md text-label-md">
                <span>1 Mo</span>
                <span>10 Yrs</span>
              </div>
            </div>

            {!editingGoalId && (
              <div>
                <div className="flex justify-between items-end mb-xs">
                  <label className="block font-body-sm text-body-sm font-medium text-on-surface">Initial Monthly Contribution</label>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant">Rp</span>
                  <input
                    value={monthlyContrib}
                    onChange={(e) => setMonthlyContrib(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-12 pr-4 py-3 font-data-tabular text-data-tabular focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="500000"
                    type="text"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Form Actions */}
          {formError && (
            <p className="mt-lg text-sm font-medium text-red-600" role="alert">{formError}</p>
          )}
          <div className="mt-xl pt-lg border-t border-surface-container-high flex justify-between items-center">
            {goals.length > 0 && (
              <button onClick={handleCloseForm} className="font-body-md text-body-md font-medium text-on-surface-variant hover:text-on-surface transition-colors md:hidden">
                Cancel
              </button>
            )}
            <div className="flex gap-md w-full md:w-auto md:ml-auto">
              {!editingGoalId && (
                <button className="hidden md:block px-lg py-3 rounded-lg border border-outline-variant font-body-md text-body-md font-medium text-on-surface hover:bg-surface-container-low transition-colors">
                  Save Draft
                </button>
              )}
              <button
                onClick={handleSaveGoal}
                disabled={isSaving}
                className="flex-1 md:flex-none px-lg py-3 rounded-lg bg-[#10b981] text-white font-body-md text-body-md font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : editingGoalId ? 'Save Changes' : 'Add Goal'}
                {!isSaving && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Preview (Bento / Glassmorphism) ── */}
        <div className="w-full lg:w-2/5 bg-surface-container-low border-l border-[#E2E8F0] p-lg md:p-xl flex flex-col relative overflow-hidden">
          {/* Decorative bg */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

          <h4 className="font-headline-sm text-body-lg font-semibold text-on-surface mb-lg relative z-10 flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">visibility</span>
            Real-time Projection
          </h4>

          {/* Preview Card */}
          <div className="glass-card rounded-xl p-lg shadow-sm mb-lg relative z-10">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">Projected Achievement</p>
            <div className="flex items-baseline gap-sm mb-md">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                Rp {targetAmount ? Number(targetAmount).toLocaleString('id-ID') : '0'}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">in {timeline} months</span>
            </div>
            {/* Progress bar */}
            <div className="relative h-2 bg-surface-container-high rounded-full overflow-hidden mb-sm">
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ width: '45%', backgroundColor: '#10b981' }}
              />
            </div>
            <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
              <span>Rp 0</span>
              <span>Target</span>
            </div>
          </div>

          {/* Insights Bento Grid */}
          <div className="grid grid-cols-2 gap-sm relative z-10">
            <div className="bg-surface-container-lowest rounded-lg p-md border border-[#E2E8F0] shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant mb-xs text-[20px]">savings</span>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Monthly Req.</p>
              <p className="font-data-tabular text-data-tabular font-semibold text-on-surface">
                Rp {monthlyContrib ? Number(monthlyContrib).toLocaleString('id-ID') : '0'}
              </p>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-md border border-[#E2E8F0] shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant mb-xs text-[20px]">event</span>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Est. Completion</p>
              <p className="font-body-md text-body-md font-semibold text-on-surface">
                {new Date(`${getTargetDate(timeline)}T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-auto relative z-10 pt-lg">
            <div className="flex items-start gap-md p-md rounded-lg border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <span className="material-symbols-outlined mt-xs text-[20px]" style={{ color: '#10b981' }}>lightbulb</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Increasing your monthly contribution by just Rp 500.000 could help you reach this goal 3 months faster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Glass card style */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        input[type=range] {
          height: 38px;
          -webkit-appearance: none;
          margin: 10px 0;
          width: 100%;
          background: transparent;
        }
        input[type=range]:focus { outline: none; }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #F1F5F9;
          border-radius: 5px;
          border: 0px solid #000000;
        }
        input[type=range]::-webkit-slider-thumb {
          box-shadow: 0px 0px 0px #000000;
          border: 2px solid #000000;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -8px;
        }
        input[type=range]:focus::-webkit-slider-runnable-track {
          background: #F1F5F9;
        }
      `}</style>
    </div>
  );
}
