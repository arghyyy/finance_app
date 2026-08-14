import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, AlertTriangle, CheckCircle, User, Briefcase } from 'lucide-react';

const MOCK_RESULT = {
  bank: 'BCA', period: '1 Jun 2026 - 30 Jun 2026',
  persona: { type: 'Freelancer', confidence: 87, reasoning: 'Varied income streams with multiple irregular deposits.' },
  income: 18500000, expenses: 12300000,
  transactions: [
    { id: 't1', date: '2026-06-15', description: 'Payment from PT Kreatif Solusi', amount: 12000000, category: 'Freelance Income', type: 'income' as const, confidence: 95 },
    { id: 't2', date: '2026-06-20', description: 'BI-FAST from Joko Widodo', amount: 3500000, category: 'Freelance Income', type: 'income' as const, confidence: 90 },
    { id: 't3', date: '2026-06-05', description: 'Alfamidi Supermarket', amount: 245000, category: 'Groceries', type: 'expense' as const, confidence: 98 },
    { id: 't4', date: '2026-06-10', description: 'PLN Postpaid', amount: 550000, category: 'Utilities', type: 'expense' as const, confidence: 98 },
    { id: 't5', date: '2026-06-12', description: 'Gojek Top Up', amount: 150000, category: 'Transport', type: 'expense' as const, confidence: 85 },
    { id: 't6', date: '2026-06-18', description: 'QRIS Payment', amount: 89000, category: 'Food & Dining', type: 'expense' as const, confidence: 50 },
    { id: 't7', date: '2026-06-22', description: 'Transfer to Savings', amount: 2000000, category: 'Transfer', type: 'expense' as const, confidence: 75 },
    { id: 't8', date: '2026-06-25', description: 'Telkomsel Prepaid', amount: 100000, category: 'Utilities', type: 'expense' as const, confidence: 98 },
    { id: 't9', date: '2026-06-28', description: 'Astra Financial Installment', amount: 1750000, category: 'Installment', type: 'expense' as const, confidence: 60 },
  ],
};

type FilterType = 'all' | 'income' | 'expense';

export default function StatementReviewPage() {
  const { id } = useParams();
  const [result] = useState(MOCK_RESULT);
  const [filter, setFilter] = useState<FilterType>('all');
  const [editing, setEditing] = useState<string | null>(null);

  const filtered = result.transactions.filter((t) => filter === 'all' || t.type === filter);
  const totalIncome = result.transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = result.transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/statements" className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">Review Transactions</h2>
            <p className="text-body-sm text-on-surface-variant">{result.bank} — {result.period}</p>
          </div>
        </div>
        <Link to="/dashboard" className="btn-primary">Confirm & Go to Dashboard</Link>
      </div>

      {/* Persona */}
      <div className="card bg-gradient-to-r from-primary-container to-surface-container-lowest border-primary-container">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-success">Detected Persona</span>
              <span className="font-semibold text-on-surface">{result.persona.type}</span>
            </div>
            <p className="text-sm text-on-surface-variant">{result.persona.reasoning}</p>
            <div className="mt-2 progress-bar max-w-xs">
              <div className="progress-fill bg-secondary-fixed-dim" style={{ width: `${result.persona.confidence}%` }} />
            </div>
            <span className="text-label-md text-on-surface-variant">Confidence: {result.persona.confidence}%</span>
          </div>
          <Briefcase className="w-6 h-6 text-on-surface-variant hidden sm:block" />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="card"><p className="text-label-md text-on-surface-variant mb-1">Total Income</p><p className="text-headline-md text-success">Rp {totalIncome.toLocaleString()}</p></div>
        <div className="card"><p className="text-label-md text-on-surface-variant mb-1">Total Expenses</p><p className="text-headline-md text-error">Rp {totalExpense.toLocaleString()}</p></div>
        <div className="card"><p className="text-label-md text-on-surface-variant mb-1">Net Cashflow</p><p className={`text-headline-md ${totalIncome - totalExpense >= 0 ? 'text-success' : 'text-error'}`}>Rp {(totalIncome - totalExpense).toLocaleString()}</p></div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'}`}>
            {f === 'all' ? 'All' : f === 'income' ? 'Income' : 'Expenses'}
          </button>
        ))}
      </div>

      {/* Transactions list */}
      <div className="card divide-y divide-outline-variant">
        {filtered.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-on-surface truncate">{tx.description}</p>
                {tx.confidence < 70 && <span title="Low confidence" className="flex shrink-0"><AlertTriangle className="w-4 h-4 text-amber-500" /></span>}
                {tx.confidence >= 90 && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-on-surface-variant">{tx.date}</span>
                <span className="badge-neutral text-[10px]">{tx.category}</span>
                {tx.confidence < 70 && (
                  <button onClick={() => setEditing(editing === tx.id ? null : tx.id)}
                    className="text-xs text-primary hover:underline flex items-center gap-0.5"><Edit2 className="w-3 h-3" /> Edit</button>
                )}
              </div>
            </div>
            <span className={`text-sm font-semibold ml-4 ${tx.type === 'income' ? 'text-success' : 'text-error'}`}>
              {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
