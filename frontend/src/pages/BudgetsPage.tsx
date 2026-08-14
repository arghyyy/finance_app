import React, { useState, useEffect, useMemo } from 'react';
import { budgetsApi } from '../services/api';
import {
  AlertTriangle, CheckCircle, XCircle, Plus, Edit2, Trash2, PieChart,
  TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Search, Filter,
  Calendar, ChevronRight, ChevronLeft, Info, RefreshCw, Eye, Sparkles
} from 'lucide-react';

// ─── Default Category Options & Icons ───
const STANDARD_CATEGORIES = [
  { name: 'Food & Groceries', icon: 'restaurant', color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-600' },
  { name: 'Shopping & Retail', icon: 'shopping_bag', color: '#ec4899', bg: 'bg-pink-50', text: 'text-pink-600' },
  { name: 'Housing & Utilities', icon: 'home', color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-600' },
  { name: 'Transport & Travel', icon: 'directions_car', color: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-600' },
  { name: 'Subscriptions & SaaS', icon: 'cloud', color: '#06b6d4', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { name: 'E-Wallet Topup', icon: 'account_balance_wallet', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { name: 'Entertainment & Leisure', icon: 'sports_esports', color: '#eab308', bg: 'bg-yellow-50', text: 'text-yellow-600' },
  { name: 'Healthcare & Insurance', icon: 'medical_services', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-600' },
  { name: 'Education & Books', icon: 'school', color: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { name: 'Business & Office', icon: 'work', color: '#14b8a6', bg: 'bg-teal-50', text: 'text-teal-600' },
  { name: 'Miscellaneous', icon: 'category', color: '#64748b', bg: 'bg-slate-50', text: 'text-slate-600' }
];

// ─── Default Mock Budgets for initial WOW demonstration ───
const DEFAULT_BUDGETS = [
  { id: 'b1', category: 'Food & Groceries', month_year: '2023-10', target_amount: 3500000, alert_threshold: 80 },
  { id: 'b2', category: 'Housing & Utilities', month_year: '2023-10', target_amount: 4500000, alert_threshold: 85 },
  { id: 'b3', category: 'Transport & Travel', month_year: '2023-10', target_amount: 1500000, alert_threshold: 80 },
  { id: 'b4', category: 'Subscriptions & SaaS', month_year: '2023-10', target_amount: 750000, alert_threshold: 90 },
  { id: 'b5', category: 'Shopping & Retail', month_year: '2023-10', target_amount: 2000000, alert_threshold: 75 },
  { id: 'b6', category: 'Entertainment & Leisure', month_year: '2023-10', target_amount: 1200000, alert_threshold: 80 },
];

// ─── Mock Transactions fallback if user hasn't uploaded statements yet ───
const FALLBACK_TRANSACTIONS = [
  { date: 'Oct 24, 2023', description: 'Whole Foods Market #142', category: 'Food & Groceries', amount: 842350, type: 'DEBIT' },
  { date: 'Oct 23, 2023', description: 'Delta Airlines Flight & GoJek', category: 'Transport & Travel', amount: 1350000, type: 'DEBIT' },
  { date: 'Oct 21, 2023', description: 'AWS Cloud & Netflix SaaS', category: 'Subscriptions & SaaS', amount: 789000, type: 'DEBIT' },
  { date: 'Oct 19, 2023', description: 'PLN Listrik & Indihome Internet', category: 'Housing & Utilities', amount: 1450000, type: 'DEBIT' },
  { date: 'Oct 15, 2023', description: 'Tokopedia & Zara Mall Retail', category: 'Shopping & Retail', amount: 1850000, type: 'DEBIT' },
  { date: 'Oct 12, 2023', description: 'Bistro Dining & Coffee Shop', category: 'Food & Groceries', amount: 1950000, type: 'DEBIT' },
  { date: 'Oct 08, 2023', description: 'Cinema 21 & Arcade Leisure', category: 'Entertainment & Leisure', amount: 650000, type: 'DEBIT' },
];

export default function BudgetsPage() {
  // Month selector state (e.g. "2023-10", "2026-07")
  const [selectedMonth, setSelectedMonth] = useState<string>('2023-10');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning' | 'exceeded'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'highest_spent' | 'highest_budget' | 'highest_percentage'>('highest_percentage');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<any | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState('Food & Groceries');
  const [customCategory, setCustomCategory] = useState('');
  const [formTarget, setFormTarget] = useState('3000000');
  const [formThreshold, setFormThreshold] = useState('80');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Budgets state (synced with localStorage & backend)
  const [budgets, setBudgets] = useState<any[]>(() => {
    const saved = localStorage.getItem(`user_budgets_${selectedMonth}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_BUDGETS;
  });

  // Transactions state from uploaded statements or fallback
  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('uploaded_statements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return FALLBACK_TRANSACTIONS;
  });

  // Reload transactions when component mounts or when localStorage changes
  useEffect(() => {
    const checkStorage = () => {
      const saved = localStorage.getItem('uploaded_statements');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTransactions(parsed);
          }
        } catch (e) {}
      }
    };
    checkStorage();
    window.addEventListener('storage', checkStorage);
    return () => window.removeEventListener('storage', checkStorage);
  }, []);

  // Fetch or sync budgets when selected month changes
  useEffect(() => {
    const saved = localStorage.getItem(`user_budgets_${selectedMonth}`);
    if (saved) {
      try {
        setBudgets(JSON.parse(saved));
      } catch (e) {
        setBudgets(DEFAULT_BUDGETS);
      }
    } else {
      setBudgets(DEFAULT_BUDGETS);
    }
    // Also try fetching from API
    budgetsApi.list(selectedMonth)
      .then((res) => {
        if (res.data && Array.isArray(res.data.budgets) && res.data.budgets.length > 0) {
          setBudgets(res.data.budgets);
          localStorage.setItem(`user_budgets_${selectedMonth}`, JSON.stringify(res.data.budgets));
        }
      })
      .catch(() => {
        // Fallback silently to local storage or defaults
      });
  }, [selectedMonth]);

  // Save budgets to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(`user_budgets_${selectedMonth}`, JSON.stringify(budgets));
  }, [budgets, selectedMonth]);

  // ─── Smart Category Matching and Realization Calculation ───
  const computedBudgets = useMemo(() => {
    return budgets.map((b) => {
      const bCat = (b.category || '').toLowerCase().trim();
      let realized = 0;
      const matchedTxs: any[] = [];

      transactions.forEach((tx) => {
        const isDebit = tx.type === 'DEBIT' || tx.type === 'expense' || !tx.type || tx.type.toLowerCase() !== 'credit';
        if (!isDebit) return;

        const txCat = (tx.category || '').toLowerCase().trim();
        const txDesc = (tx.description || '').toLowerCase().trim();

        // Check matching category or keyword in description
        const catMatch =
          bCat === txCat ||
          (bCat.includes(txCat) && txCat.length > 2) ||
          (txCat.includes(bCat) && bCat.length > 2) ||
          (bCat.includes('food') && (txCat.includes('food') || txCat.includes('dining') || txCat.includes('groceries') || txDesc.includes('resto') || txDesc.includes('cafe'))) ||
          (bCat.includes('transport') && (txCat.includes('travel') || txCat.includes('transport') || txDesc.includes('gojek') || txDesc.includes('grab') || txDesc.includes('flight'))) ||
          (bCat.includes('housing') && (txCat.includes('utilities') || txCat.includes('housing') || txDesc.includes('pln') || txDesc.includes('indihome'))) ||
          (bCat.includes('shopping') && (txCat.includes('shopping') || txCat.includes('retail') || txDesc.includes('tokopedia') || txDesc.includes('shopee'))) ||
          (bCat.includes('subscription') && (txCat.includes('subscription') || txCat.includes('saas') || txDesc.includes('netflix') || txDesc.includes('aws')));

        if (catMatch) {
          const amt = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount || 0).replace(/[^0-9.-]+/g, ''));
          realized += amt;
          matchedTxs.push(tx);
        }
      });

      const target = Number(b.target_amount || 0);
      const percentage = target > 0 ? (realized / target) * 100 : (realized > 0 ? 100 : 0);
      const threshold = Number(b.alert_threshold || 80);

      let status: 'normal' | 'warning' | 'exceeded' = 'normal';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= threshold) status = 'warning';

      const catMeta = STANDARD_CATEGORIES.find(c => c.name.toLowerCase() === bCat) ||
        STANDARD_CATEGORIES.find(c => bCat.includes(c.name.toLowerCase().split(' ')[0])) ||
        { name: b.category, icon: 'category', color: '#64748b', bg: 'bg-slate-50', text: 'text-slate-600' };

      return {
        ...b,
        realized_amount: realized,
        percentage: Math.round(percentage * 10) / 10,
        status,
        alert_threshold: threshold,
        meta: catMeta,
        matchedTransactions: matchedTxs
      };
    });
  }, [budgets, transactions]);

  // ─── Filtered and Sorted Budgets ───
  const displayedBudgets = useMemo(() => {
    return computedBudgets
      .filter((b) => {
        const matchesSearch = b.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.category.localeCompare(b.category);
        if (sortBy === 'highest_spent') return b.realized_amount - a.realized_amount;
        if (sortBy === 'highest_budget') return b.target_amount - a.target_amount;
        return b.percentage - a.percentage;
      });
  }, [computedBudgets, searchQuery, statusFilter, sortBy]);

  // ─── Summary Totals ───
  const summary = useMemo(() => {
    let totalBudget = 0;
    let totalRealized = 0;
    let normalCount = 0;
    let warningCount = 0;
    let exceededCount = 0;

    computedBudgets.forEach((b) => {
      totalBudget += b.target_amount;
      totalRealized += b.realized_amount;
      if (b.status === 'normal') normalCount++;
      if (b.status === 'warning') warningCount++;
      if (b.status === 'exceeded') exceededCount++;
    });

    const overallPct = totalBudget > 0 ? (totalRealized / totalBudget) * 100 : 0;
    const remaining = totalBudget - totalRealized;

    return {
      totalBudget,
      totalRealized,
      remaining,
      overallPct: Math.round(overallPct * 10) / 10,
      normalCount,
      warningCount,
      exceededCount,
    };
  }, [computedBudgets]);

  // ─── Handlers ───
  const handleOpenAddModal = () => {
    setEditingBudget(null);
    setFormCategory('Food & Groceries');
    setCustomCategory('');
    setFormTarget('3000000');
    setFormThreshold('80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingBudget(b);
    setFormCategory(STANDARD_CATEGORIES.some(c => c.name === b.category) ? b.category : 'Custom');
    setCustomCategory(STANDARD_CATEGORIES.some(c => c.name === b.category) ? '' : b.category);
    setFormTarget(String(b.target_amount || 0));
    setFormThreshold(String(b.alert_threshold || 80));
    setIsModalOpen(true);
  };

  const handleDeleteBudget = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this category budget?')) return;
    const next = budgets.filter(b => b.id !== id);
    setBudgets(next);
    budgetsApi.delete(id).catch(() => {});
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalCat = formCategory === 'Custom' ? (customCategory.trim() || 'Custom Category') : formCategory;
    const targetNum = Number(formTarget.replace(/[^0-9.-]+/g, '')) || 0;
    const thresholdNum = Number(formThreshold) || 80;

    if (editingBudget) {
      // Update existing
      const next = budgets.map(b => b.id === editingBudget.id ? {
        ...b,
        category: finalCat,
        target_amount: targetNum,
        alert_threshold: thresholdNum
      } : b);
      setBudgets(next);
      budgetsApi.update(editingBudget.id, { target_amount: targetNum, alert_threshold: thresholdNum, category: finalCat }).catch(() => {});
    } else {
      // Create new
      const newB = {
        id: Date.now().toString(),
        category: finalCat,
        month_year: selectedMonth,
        target_amount: targetNum,
        alert_threshold: thresholdNum
      };
      setBudgets([...budgets, newB]);
      budgetsApi.create({ category: finalCat, month_year: selectedMonth, target_amount: targetNum, alert_threshold: thresholdNum }).catch(() => {});
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  // Month navigation helper
  const changeMonth = (delta: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 1 + delta, 1);
    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${ny}-${nm}`);
  };

  const getStatusBadge = (status: string, threshold: number) => {
    if (status === 'exceeded') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-extrabold border border-red-200 shadow-sm animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          EXCEEDED BUDGET
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          NEAR LIMIT (≥{threshold}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        ON TRACK
      </span>
    );
  };

  return (
    <div className="max-w-[1440px] w-full mx-auto pb-24 font-sans text-on-surface">
      {/* ─── Header & Controls ─── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Monthly Trajectory
            </span>
            <span className="text-on-surface-variant text-sm font-medium">• Real-time Realization</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0f172a]">
            Budget Tracking
          </h1>
          <p className="text-on-surface-variant text-base mt-1">
            Monitor real-time spending vs targets, set alerts, and optimize category allocations.
          </p>
        </div>

        {/* Action Controls & Month Picker */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Month Selector */}
          <div className="flex items-center bg-white border border-outline-variant/60 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 font-bold text-sm text-[#0f172a] min-w-[140px] justify-center">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#10b981]/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Set Category Budget
          </button>
        </div>
      </div>

      {/* ─── Real-Time Alert Summary Banner (if any warnings or exceeded) ─── */}
      {(summary.exceededCount > 0 || summary.warningCount > 0) && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-orange-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-red-600 animate-bounce">notification_important</span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[#0f172a] flex items-center gap-2">
                Attention Required: Budget Alert Triggered!
                {summary.exceededCount > 0 && (
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[11px] font-bold">
                    {summary.exceededCount} EXCEEDED
                  </span>
                )}
                {summary.warningCount > 0 && (
                  <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[11px] font-bold">
                    {summary.warningCount} APPROACHING LIMIT
                  </span>
                )}
              </h4>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Some spending categories have reached or exceeded their monthly alert threshold. Review below to adjust allocations.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter(summary.exceededCount > 0 ? 'exceeded' : 'warning')}
            className="px-4 py-2 bg-white hover:bg-orange-100/50 text-[#0f172a] text-xs font-bold rounded-xl border border-orange-200 shadow-sm transition-colors shrink-0"
          >
            Filter Affected Categories
          </button>
        </div>
      )}

      {/* ─── Hero Summary Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Left Bento: Total Budget vs Spent */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-outline-variant/60 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background graphic */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Overall Monthly Performance</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] mt-1">
                Rp {summary.totalRealized.toLocaleString('id-ID')}
                <span className="text-base font-normal text-on-surface-variant ml-2">
                  / Rp {summary.totalBudget.toLocaleString('id-ID')}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-on-surface-variant block font-semibold">Overall Utilization</span>
                <span className={`text-xl font-extrabold ${summary.overallPct >= 100 ? 'text-red-600' : summary.overallPct >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {summary.overallPct}%
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${summary.overallPct >= 100 ? 'bg-red-100 text-red-600' : summary.overallPct >= 80 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <PieChart className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-xs font-bold text-on-surface-variant">
              <span>Realized Spending</span>
              <span>
                {summary.remaining >= 0 ? (
                  <span className="text-emerald-600 font-extrabold">+Rp {summary.remaining.toLocaleString('id-ID')} Remaining Safe Budget</span>
                ) : (
                  <span className="text-red-600 font-extrabold">-Rp {Math.abs(summary.remaining).toLocaleString('id-ID')} Overspent</span>
                )}
              </span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner flex">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  summary.overallPct >= 100 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                  summary.overallPct >= 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                  'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
                style={{ width: `${Math.min(Math.max(summary.overallPct, 3), 100)}%` }}
              />
            </div>
          </div>

          {/* Mini Stats Footer */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-outline-variant/40">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">On Track</span>
              <span className="text-lg font-extrabold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                <CheckCircle className="w-4 h-4" /> {summary.normalCount} Categories
              </span>
            </div>
            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/50">
              <span className="text-[11px] font-bold text-amber-700 uppercase block">Near Threshold</span>
              <span className="text-lg font-extrabold text-amber-700 flex items-center gap-1.5 mt-0.5">
                <AlertTriangle className="w-4 h-4" /> {summary.warningCount} Categories
              </span>
            </div>
            <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-200/50">
              <span className="text-[11px] font-bold text-red-700 uppercase block">Exceeded</span>
              <span className="text-lg font-extrabold text-red-600 flex items-center gap-1.5 mt-0.5">
                <XCircle className="w-4 h-4" /> {summary.exceededCount} Categories
              </span>
            </div>
          </div>
        </div>

        {/* Right Bento: Quick AI Recommendation */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="bg-white/10 text-emerald-300 border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">auto_awesome</span> Smart Coach
              </span>
              <span className="text-xs text-slate-400 font-mono">{selectedMonth}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 leading-snug">
              {summary.exceededCount > 0
                ? "Immediate Rebalance Recommended"
                : summary.warningCount > 0
                ? "Watch Your High-Velocity Spending"
                : "Optimal Financial Discipline Observed"}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {summary.exceededCount > 0
                ? `You have overspent in ${summary.exceededCount} categor${summary.exceededCount > 1 ? 'ies' : 'y'}. Consider reallocating funds from your underutilized entertainment budget to avoid cashflow deficits.`
                : summary.warningCount > 0
                ? `You are within 20% of your limit for ${summary.warningCount} categor${summary.warningCount > 1 ? 'ies' : 'y'}. We recommend pacing weekend dining and non-essential retail purchases.`
                : "Your realization is well aligned across all categories. Continuing this pace will allow a 15% surplus transfer into your Emergency Fund at month end."}
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
              Automated syncing enabled
            </div>
            <button
              onClick={() => alert("Rebalance calculation initiated! Checking portfolio holding distributions...")}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 transition-colors"
            >
              Analyze Rebalance &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-white rounded-2xl p-4 border border-outline-variant/60 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search category name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-outline-variant/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-outline-variant/40 text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="all">All StatusES ({computedBudgets.length})</option>
            <option value="normal">🟢 On Track ({summary.normalCount})</option>
            <option value="warning">🟡 Near Limit ({summary.warningCount})</option>
            <option value="exceeded">🔴 Exceeded ({summary.exceededCount})</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="hidden sm:block px-3.5 py-2.5 bg-slate-50 rounded-xl border border-outline-variant/40 text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="highest_percentage">Sort by: % Used (High &rarr; Low)</option>
            <option value="highest_spent">Sort by: Highest Realization</option>
            <option value="highest_budget">Sort by: Highest Target</option>
            <option value="name">Sort by: Name (A-Z)</option>
          </select>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-outline-variant/30">
          <span className="text-xs font-bold text-on-surface-variant mr-1 hidden sm:inline">View:</span>
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === 'grid' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-500 hover:text-[#0f172a]'}`}
            >
              <span className="material-symbols-outlined text-base">grid_view</span> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === 'table' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-500 hover:text-[#0f172a]'}`}
            >
              <span className="material-symbols-outlined text-base">table_rows</span> Table
            </button>
          </div>
        </div>
      </div>

      {/* ─── Category Budgets Grid / Table ─── */}
      {displayedBudgets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-outline-variant/60 shadow-sm max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0f172a]">No budget categories found</h3>
          <p className="text-sm text-on-surface-variant mt-1 mb-6">
            We couldn't find any categories matching your current filter criteria for {selectedMonth}.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ═══ Bento Grid View ═══ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBudgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.id}
                onClick={() => setSelectedCategoryDetail(b)}
                className={`group bg-white rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:-translate-y-1 ${
                  isExceeded ? 'border-red-300/80 bg-gradient-to-b from-white via-white to-red-50/30' :
                  isWarning ? 'border-amber-300/80 bg-gradient-to-b from-white via-white to-amber-50/20' :
                  'border-outline-variant/60 hover:border-emerald-300'
                }`}
              >
                {/* Top header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl ${b.meta.bg} flex items-center justify-center shrink-0 shadow-sm border border-black/5`}>
                        <span className={`material-symbols-outlined text-2xl ${b.meta.text}`} style={{ color: b.meta.color }}>
                          {b.meta.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#0f172a] leading-tight group-hover:text-primary transition-colors">
                          {b.category}
                        </h3>
                        <p className="text-xs font-semibold text-on-surface-variant mt-0.5">
                          Alert at ≥{b.alert_threshold}%
                        </p>
                      </div>
                    </div>

                    {/* Quick Edit/Delete Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEditModal(b, e)}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-[#0f172a] transition-colors"
                        title="Edit Target & Threshold"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBudget(b.id, e)}
                        className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Realized vs Target Amount */}
                  <div className="my-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                        Rp {b.realized_amount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs font-bold text-on-surface-variant">
                        of Rp {b.target_amount.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 flex mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isExceeded ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                          isWarning ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                          'bg-gradient-to-r from-emerald-400 to-teal-500'
                        }`}
                        style={{ width: `${Math.min(Math.max(b.percentage, 4), 100)}%` }}
                      />
                    </div>

                    {/* Status badge & Percentage row */}
                    <div className="flex items-center justify-between mt-3">
                      {getStatusBadge(b.status, b.alert_threshold)}
                      <span className={`text-sm font-extrabold font-mono ${
                        isExceeded ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {b.percentage}% Used
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Drilldown trigger */}
                <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-primary transition-colors">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {b.matchedTransactions.length} transaction{b.matchedTransactions.length !== 1 ? 's' : ''} detected
                  </span>
                  <span className="flex items-center">
                    View Breakdown &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═══ Table View ═══ */
        <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-outline-variant/60">
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-[#0f172a]">Category</th>
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-[#0f172a] text-right">Target Budget</th>
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-[#0f172a] text-right">Realized Spent</th>
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-[#0f172a] text-center">Progress</th>
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-[#0f172a] text-center">Alert Status</th>
                  <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-[#0f172a] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {displayedBudgets.map((b) => {
                  const isExceeded = b.status === 'exceeded';
                  const isWarning = b.status === 'warning';

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedCategoryDetail(b)}
                      className="hover:bg-slate-50/60 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${b.meta.bg} flex items-center justify-center shrink-0 border border-black/5`}>
                            <span className={`material-symbols-outlined text-xl`} style={{ color: b.meta.color }}>
                              {b.meta.icon}
                            </span>
                          </div>
                          <div>
                            <span className="font-extrabold text-[#0f172a] block text-sm group-hover:text-primary transition-colors">{b.category}</span>
                            <span className="text-[11px] text-on-surface-variant font-medium">{b.matchedTransactions.length} txs</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-sm text-[#0f172a]">
                        Rp {b.target_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-sm text-[#0f172a]">
                        Rp {b.realized_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center w-48">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full rounded-full ${isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(Math.max(b.percentage, 5), 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold font-mono ${isExceeded ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {b.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(b.status, b.alert_threshold)}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleOpenEditModal(b, e)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#0f172a] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteBudget(b.id, e)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add/Edit Budget Modal ─── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-[0_10px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-outline-variant">
            <div className="px-6 py-5 border-b border-outline-variant/60 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#0f172a]">
                    {editingBudget ? 'Edit Budget Target' : 'Set Category Budget'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">For month: {selectedMonth}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200/60 text-slate-400 hover:text-[#0f172a] transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-5">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Expense Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  disabled={!!editingBudget}
                  className="w-full bg-slate-50 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 cursor-pointer"
                >
                  {STANDARD_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                  <option value="Custom">+ Custom Category Name...</option>
                </select>
              </div>

              {/* Custom category name input if selected */}
              {formCategory === 'Custom' && !editingBudget && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pet Care & Vet, Gym & Fitness"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {/* Target Amount */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Monthly Target Budget (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-500 text-sm">Rp</span>
                  <input
                    type="text"
                    required
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder="3000000"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-outline-variant/60 rounded-xl text-base font-extrabold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-primary" /> Enter the maximum limit you want to allocate for this category.
                </p>
              </div>

              {/* Alert Threshold Slider */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Alert / Warning Threshold
                  </label>
                  <span className="text-sm font-extrabold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    ≥ {formThreshold}% of budget
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={formThreshold}
                  onChange={(e) => setFormThreshold(e.target.value)}
                  className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1">
                  <span>50% (Early warning)</span>
                  <span>80% (Recommended)</span>
                  <span>95% (Strict)</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-outline-variant/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#10b981]/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Interactive Drilldown Modal (View Real-time Transactions) ─── */}
      {selectedCategoryDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCategoryDetail(null); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-[0_15px_60px_rgba(0,0,0,0.2)] overflow-hidden border border-outline-variant flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-outline-variant/60 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl ${selectedCategoryDetail.meta.bg} flex items-center justify-center border border-black/5`}>
                  <span className={`material-symbols-outlined text-2xl`} style={{ color: selectedCategoryDetail.meta.color }}>
                    {selectedCategoryDetail.meta.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#0f172a]">{selectedCategoryDetail.category}</h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Month: {selectedMonth} • {selectedCategoryDetail.matchedTransactions.length} transaction{selectedCategoryDetail.matchedTransactions.length !== 1 ? 's' : ''} recorded
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategoryDetail(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200/60 text-slate-400 hover:text-[#0f172a] transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Stats row */}
            <div className="p-6 bg-slate-50/50 border-b border-outline-variant/40 grid grid-cols-3 gap-4">
              <div className="bg-white p-3.5 rounded-2xl border border-outline-variant/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Target Budget</span>
                <span className="text-base font-extrabold text-[#0f172a] mt-0.5 block">
                  Rp {selectedCategoryDetail.target_amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-outline-variant/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Realized Spent</span>
                <span className="text-base font-extrabold text-[#0f172a] mt-0.5 block">
                  Rp {selectedCategoryDetail.realized_amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-outline-variant/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Status</span>
                <div className="mt-1">
                  {getStatusBadge(selectedCategoryDetail.status, selectedCategoryDetail.alert_threshold)}
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant mb-2">
                Real-Time Recorded Transactions
              </h4>
              {selectedCategoryDetail.matchedTransactions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">receipt_long</span>
                  <p className="text-sm font-bold text-slate-600">No transactions recorded for this category yet</p>
                  <p className="text-xs text-slate-400 mt-1">Upload an e-statement or add a manual entry in Statements to populate this list.</p>
                </div>
              ) : (
                selectedCategoryDetail.matchedTransactions.map((tx: any, idx: number) => {
                  const amt = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount || 0).replace(/[^0-9.-]+/g, ''));
                  return (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {tx.date ? tx.date.split(' ')[0] : 'TX'}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-[#0f172a]">{tx.description || 'Expense Transaction'}</p>
                          <p className="text-xs text-on-surface-variant font-medium">{tx.date || selectedMonth}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-sm text-[#0f172a]">
                        -Rp {amt.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-outline-variant/60 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">
                Want to adjust this allocation?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const b = selectedCategoryDetail;
                    setSelectedCategoryDetail(null);
                    handleOpenEditModal(b);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Target
                </button>
                <button
                  onClick={() => setSelectedCategoryDetail(null)}
                  className="px-5 py-2 bg-white border border-outline-variant text-[#0f172a] font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
