import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// ─── Types ───
interface NewsItem {
  title: string;
  source: string;
  time: string;
  category: string;
  desc: string;
}

// ─── Removed Mock News Data ───

const MOCK_TRANSACTIONS = [
  { id: 'm1', date: 'Oct 24, 2023', description: 'Acme Corp Consulting Services', category: 'Business', amountFormatted: '$4,500.00', type: 'CREDIT' },
  { id: 'm2', date: 'Oct 23, 2023', description: 'Delta Airlines - Flight DL452', category: 'Travel', amountFormatted: '$650.00', type: 'DEBIT' },
  { id: 'm3', date: 'Oct 22, 2023', description: 'Whole Foods Market #142', category: 'Food', amountFormatted: '$142.35', type: 'DEBIT' },
  { id: 'm4', date: 'Oct 21, 2023', description: 'AWS Cloud Hosting Monthly', category: 'Technology', amountFormatted: '$89.99', type: 'DEBIT' },
  { id: 'm5', date: 'Oct 20, 2023', description: 'Client Retainer - Smith LLC', category: 'Business', amountFormatted: '$2,000.00', type: 'CREDIT' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statements, setStatements] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTx, setEditingTx] = useState<any>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/statements/transactions');
      setStatements(data);
    } catch (e) {
      console.error(e);
    }
  };

  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({ name: '', bank_name: '', initial_balance: '' });

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts/');
      setAccounts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAccount = async () => {
    try {
      await api.post('/accounts/', {
        name: newAccountForm.name,
        type: 'BANK',
        bank_name: newAccountForm.bank_name,
        include_in_net_worth: true,
        initial_balance: Number(newAccountForm.initial_balance.replace(/\./g, '')) || 0
      });
      setShowAddAccount(false);
      setNewAccountForm({ name: '', bank_name: '', initial_balance: '' });
      fetchAccounts();
    } catch (e: any) {
      alert('Error connecting to server: ' + (e.response?.data?.detail || e.message));
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this account? This will also delete ALL transactions associated with it.");
    if (!confirmed) return;
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
      fetchTransactions();
    } catch (e) {
      alert("Error deleting account");
    }
  };

  const localNetFlow = statements.reduce((sum, tx) => {
    return sum + (tx.type === 'CREDIT' ? (Number(tx.amount) || 0) : -(Number(tx.amount) || 0));
  }, 0);

  const netWorth = accounts.reduce((sum, acc) => sum + (Number(acc.current_balance) || 0), 0) + localNetFlow;

  const handleExport = () => {
    if (statements.length === 0) {
      alert("No transactions available to export.");
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Balance'];
    const csvRows = [headers.join(',')];

    statements.forEach(tx => {
      const row = [
        `"${tx.date || ''}"`,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        `"${tx.category || 'Uncategorized'}"`,
        `"${tx.type || ''}"`,
        `"${tx.amount || 0}"`,
        `"${tx.balance || 0}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalExpense = statements.filter(s => s.type === 'DEBIT').reduce((sum, s) => sum + s.amount, 0);

  const handleDeleteTx = async (idx: number, id: string) => {
    if (!id) {
      const updated = [...statements];
      updated.splice(idx, 1);
      setStatements(updated);
      return;
    }
    try {
      await api.delete(`/statements/transactions/${id}`);
      const updated = [...statements];
      updated.splice(idx, 1);
      setStatements(updated);
      const newTotalPages = Math.ceil(updated.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (e) {
      alert("Failed to delete transaction from database.");
    }
  };

  const handleUpdateTx = async () => {
    if (!editingTx) return;
    try {
      const res = await api.put(`/statements/transactions/${editingTx.id}`, {
        date: editingTx.date,
        description: editingTx.description,
        category: editingTx.category,
        amount: Number(editingTx.amount),
        type: editingTx.type
      });

      const data = res.data;
      const updated = [...statements];
      updated[editingTx.originalIdx] = {
        ...updated[editingTx.originalIdx],
        ...data.transaction
      };
      setStatements(updated);
      setEditingTx(null);
    } catch (e) {
      alert("Error updating transaction");
    }
  };

  const totalPages = Math.ceil((statements.length > 0 ? statements.length : MOCK_TRANSACTIONS.length) / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const renderTransactions = statements.length > 0
    ? statements.slice(startIndex, startIndex + itemsPerPage).map((tx, idx) => ({
      originalIdx: startIndex + idx,
      id: tx.id,
      date: tx.date,
      description: tx.description,
      category: tx.category || 'Uncategorized',
      amount: tx.amount,
      amountFormatted: `Rp ${tx.amount.toLocaleString('id-ID')}`,
      type: tx.type,
      balance: tx.balance
    }))
    : MOCK_TRANSACTIONS.slice(startIndex, startIndex + itemsPerPage).map((tx, idx) => ({ ...tx, originalIdx: startIndex + idx, amount: 0 }));

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('business')) return 'work';
    if (cat.includes('travel') || cat.includes('transport')) return 'flight';
    if (cat.includes('food')) return 'restaurant';
    if (cat.includes('technology') || cat.includes('software')) return 'memory';
    if (cat.includes('shopping')) return 'shopping_bag';
    if (cat.includes('transfer')) return 'sync_alt';
    if (cat.includes('utilities')) return 'bolt';
    return 'category';
  };

  return (
    <div className="flex-1 w-full bg-[#f4f5f7] p-8 md:p-12 font-sans min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-[36px] font-bold text-[#1a1a1a] mb-1 tracking-tight">Transactions</h2>
          <p className="text-[16px] text-gray-500">Review and manage your uploaded financial records.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-5 py-2.5 rounded-lg border border-gray-200 text-[#1a1a1a] font-semibold text-[14px] hover:bg-gray-50 flex items-center gap-2 transition-colors bg-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </button>
          <button onClick={() => navigate('/statements')} className="px-5 py-2.5 rounded-lg bg-black text-white font-semibold text-[14px] hover:bg-gray-800 flex items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">upload</span> Upload
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1 */}
        <div className="bg-white rounded-[16px] p-6 border border-gray-200 shadow-sm relative overflow-hidden h-[180px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#d1fae5] rounded-full -mr-16 -mt-16 opacity-70"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-[13px] text-gray-500 font-medium mt-1">Total Uploaded Transactions</p>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#1a1a1a]">receipt_long</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-[36px] font-bold text-[#1a1a1a] mb-2">{statements.length > 0 ? statements.length.toLocaleString('en-US') : '1,248'}</h3>
            <p className="text-[12px] font-bold text-[#10b981] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12% from last month
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[16px] p-6 border border-gray-200 shadow-sm relative h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[13px] text-gray-500 font-medium mt-1">Total Monthly Expenses</p>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#1a1a1a]">payments</span>
            </div>
          </div>
          <div>
            <h3 className="text-[32px] xl:text-[36px] font-bold text-[#1a1a1a] mb-2">{statements.length > 0 ? 'Rp ' + totalExpense.toLocaleString('id-ID') : '$142,590.00'}</h3>
            <p className="text-[12px] text-gray-500 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">info</span> Pending: {statements.length > 0 ? 'Rp 0' : '$4,200.00'}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[16px] p-6 border border-gray-200 shadow-sm relative h-[180px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[13px] text-gray-500 font-medium mt-1">Risk Profile</p>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#1a1a1a]">shield</span>
            </div>
          </div>
          <div>
            <h3 className="text-[28px] xl:text-[32px] font-bold text-[#1a1a1a] leading-tight mb-3">Moderate-<br />Aggressive</h3>
            <div className="flex items-center gap-2">
              <span className="bg-[#10b981] text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Active Strategy</span>
              <span className="text-[11px] text-gray-500 font-semibold truncate">Based on current allocations</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Accounts & Net Worth */}
      <div className="flex items-center justify-between mb-4 mt-6">
        <div>
          <h3 className="text-[22px] font-bold text-[#1a1a1a]">My Accounts (Net Worth: Rp {netWorth.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })})</h3>
        </div>
        <button onClick={() => setShowAddAccount(!showAddAccount)} className="px-4 py-2 bg-[#10b981] text-white rounded-lg text-[13px] font-bold shadow-sm hover:opacity-90">
          + Add Account
        </button>
      </div>

      {showAddAccount && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-[12px] font-bold text-gray-500 mb-1 block">Account Name (e.g. Personal Savings)</label>
            <input type="text" value={newAccountForm.name} onChange={e => setNewAccountForm({ ...newAccountForm, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px]" />
          </div>
          <div className="flex-1">
            <label className="text-[12px] font-bold text-gray-500 mb-1 block">Bank Name (e.g. BCA, GoPay)</label>
            <input type="text" value={newAccountForm.bank_name} onChange={e => setNewAccountForm({ ...newAccountForm, bank_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px]" />
          </div>
          <div className="flex-1">
            <label className="text-[12px] font-bold text-gray-500 mb-1 block">Initial Balance (Rp)</label>
            <input
              type="text"
              value={newAccountForm.initial_balance}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                if (!val) {
                  setNewAccountForm({ ...newAccountForm, initial_balance: '' });
                } else {
                  setNewAccountForm({ ...newAccountForm, initial_balance: Number(val).toLocaleString('id-ID') });
                }
              }}
              placeholder="e.g. 1.000.000"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px]"
            />
          </div>
          <button onClick={handleCreateAccount} className="px-6 py-2 bg-black text-white rounded-lg font-bold">Save</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {accounts.map((acc, idx) => {
          // Use the current balance directly from the database
          const displayBalance = Number(acc.current_balance) || 0;
          return (
            <div key={idx} className="bg-white rounded-[16px] p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
              <button onClick={() => handleDeleteAccount(acc.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
              <div className="flex items-center gap-3 mb-4 pr-8">
                <div className="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#4b5563]">account_balance</span>
                </div>
                <div className="truncate">
                  <h4 className="text-[16px] font-bold text-[#1a1a1a] truncate">{acc.name}</h4>
                  <span className="text-[12px] text-gray-500 font-semibold truncate block">{acc.bank_name}</span>
                </div>
              </div>
              <p className="text-[13px] text-gray-500 mb-1">Current Balance</p>
              <h3 className="text-[24px] font-bold text-[#3b82f6]">Rp {displayBalance.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</h3>
            </div>
          )
        })}
        {accounts.length === 0 && !showAddAccount && (
          <div className="col-span-3 text-center py-10 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500 font-medium">No accounts found. Please add an account to track your net worth.</p>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input type="text" placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] rounded-lg border-none text-[14px] focus:ring-2 focus:ring-gray-200 outline-none transition-shadow" />
          </div>
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-[#1a1a1a] flex items-center justify-between gap-2 min-w-[150px] bg-white hover:bg-gray-50 transition-colors shrink-0">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-gray-500">calendar_today</span> Last 30 Days</span>
              <span className="material-symbols-outlined text-[16px] text-gray-400">expand_more</span>
            </button>
            <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-[#1a1a1a] flex items-center justify-between gap-2 min-w-[150px] bg-white hover:bg-gray-50 transition-colors shrink-0">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-gray-500">filter_list</span> All Categories</span>
              <span className="material-symbols-outlined text-[16px] text-gray-400">expand_more</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-[13px] font-bold text-[#1a1a1a]">Date</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#1a1a1a]">Description</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#1a1a1a]">Category</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#1a1a1a] text-right">Amount</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#1a1a1a] text-center w-12"></th>
              </tr>
            </thead>
            <tbody>
              {renderTransactions.map((tx, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-[14px] text-gray-500 whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-4 text-[14px] font-semibold text-[#1a1a1a] truncate max-w-[300px]">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f3f4f6] text-[#4b5563] text-[12px] font-bold border border-gray-200/60 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">{getCategoryIcon(tx.category)}</span> {tx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-[14px] font-semibold text-right whitespace-nowrap ${tx.type === 'CREDIT' ? 'text-[#10b981]' : 'text-[#1a1a1a]'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{tx.amountFormatted}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                      <button onClick={() => setEditingTx({ ...tx })} className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDeleteTx(tx.originalIdx, tx.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-[13px]">
          <span>Showing {statements.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, statements.length)} of {statements.length > 0 ? statements.length : '1,248'} entries</span>
          <div className="flex gap-1">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-30">&lt;</button>
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${currentPage === pageNum ? 'bg-gray-200 text-[#1a1a1a] font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {pageNum}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-30">&gt;</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-6">Edit Transaction</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1">Date</label>
                <input type="text" value={editingTx.date} onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px]" />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1">Description</label>
                <input type="text" value={editingTx.description} onChange={(e) => setEditingTx({ ...editingTx, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px]" />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1">Category</label>
                <input type="text" value={editingTx.category} onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-1">Type</label>
                  <select value={editingTx.type} onChange={(e) => setEditingTx({ ...editingTx, type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px] bg-white">
                    <option value="DEBIT">Debit (Expense)</option>
                    <option value="CREDIT">Credit (Income)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-1">Amount (Rp)</label>
                  <input type="number" value={editingTx.amount} onChange={(e) => setEditingTx({ ...editingTx, amount: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px]" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setEditingTx(null)} className="px-5 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleUpdateTx} className="px-5 py-2 rounded-lg bg-[#10b981] text-white font-bold hover:bg-[#059669] transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
