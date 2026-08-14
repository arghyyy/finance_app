import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Icon = ({ name, className = '', fill = false }: { name: string; className?: string; fill?: boolean }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: fill ? "'FILL' 1" : undefined }}
  >
    {name}
  </span>
);

export default function ManualEntryPage() {
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/accounts/');
        const data = res.data;
        if (data.length > 0) {
          const lastSelected = localStorage.getItem('last_selected_account_id');
          const defaultAccountId = lastSelected && data.some((a: any) => a.id === lastSelected)
            ? lastSelected
            : data[0].id;
          setAccountId(defaultAccountId);
        }
      } catch (e) {}
    };
    fetchAccounts();
  }, []);
const [transactionType, setTransactionType] = useState<'Expense' | 'Income'>('Expense');
const [amount, setAmount] = useState<string>('0');
const [isCategoryOpen, setIsCategoryOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState('Select a category...');
const [date, setDate] = useState(new Date().toLocaleDateString('id-ID'));
const [description, setDescription] = useState('');
const [notes, setNotes] = useState('');

const expenseCategories = [
  'Housing',
  'Transportation',
  'Food & Dining',
  'Utilities',
  'Insurance',
  'Medical & Healthcare',
  'Entertainment',
  'Miscellaneous',
  'Dana Darurat',
  'Menikah',
  'Membeli Mobil',
  'Travelling',
  'Dana Pensiun',
  'Dana Pendidikan Anak'
];

const incomeCategories = [
  'Salary',
  'Bonus',
  'Dividend',
  'Freelance',
  'Interest',
  'Gift',
  'Rental Income',
  'Other'
];

const categories = transactionType === 'Expense' ? expenseCategories : incomeCategories;

const handleTypeChange = (type: 'Expense' | 'Income') => {
  setTransactionType(type);
  setSelectedCategory('Select a category...');
};

// For demonstration
const baseCashflow = 12450000;
const numAmount = parseFloat(amount || '0');
const pendingAmount = transactionType === 'Expense' ? -numAmount : numAmount;
const projectedCashflow = baseCashflow + pendingAmount;

const handleAddTransaction = () => {
  if (!description) {
    alert("Please enter a description");
    return;
  }
  if (selectedCategory === 'Select a category...') {
    alert("Please select a category");
    return;
  }
  if (numAmount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  const newTx = {
    date: date,
    description: notes ? `${description} (${notes})` : description,
    category: selectedCategory,
    amount: numAmount,
    type: transactionType === 'Expense' ? 'DEBIT' : 'CREDIT',
    balance: null
  };

  // Save to Database
  api.post('/statements/transactions', {
    account_id: accountId,
    date: date,
    description: notes ? `${description} (${notes})` : description,
    category: selectedCategory,
    amount: numAmount,
    type: transactionType === 'Expense' ? 'DEBIT' : 'CREDIT'
  }).then(() => {
    navigate('/dashboard');
  }).catch(e => {
    alert("Error saving to database: " + e.message);
    navigate('/dashboard');
  });
};

return (
  <div className="max-w-[1200px] mx-auto w-full">
    {/* Top Header matching mockup */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 pb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/statements')}
          className="flex items-center gap-2 text-[#45464d] font-semibold text-[14px] hover:text-[#000000] transition-colors"
        >
          <Icon name="arrow_back" className="text-[20px]" />
          Back to Statements
        </button>
        <div className="h-6 w-px bg-[#c6c6cd]"></div>
        <h2 className="text-[24px] font-bold text-[#000000] tracking-tight">Manual Entry</h2>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* Left Side: Form Container */}
      <div className="lg:col-span-8 bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm">

        {/* Transaction Type */}
        <div className="mb-6">
          <label className="block text-[12px] font-bold text-[#76777d] uppercase tracking-wider mb-2">Transaction Type</label>
          <div className="flex w-full md:w-64 bg-[#f2f4f6] rounded-lg p-1">
            <button
              onClick={() => handleTypeChange('Expense')}
              className={`flex-1 py-2 text-[14px] font-semibold rounded-md transition-colors ${transactionType === 'Expense' ? 'bg-[#c8232c] text-white shadow-sm' : 'text-[#45464d] hover:bg-[#e2e8f0]'}`}
            >
              Expense
            </button>

            <button
              onClick={() => handleTypeChange('Income')}
              className={`flex-1 py-2 text-[14px] font-semibold rounded-md transition-colors ${transactionType === 'Income' ? 'bg-[#006c49] text-white shadow-sm' : 'text-[#45464d] hover:bg-[#e2e8f0]'}`}
            >
              Income
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Transaction Date */}
          <div>
            <label className="block text-[12px] font-bold text-[#45464d] mb-2">Transaction Date</label>
            <div className="relative">
              <Icon name="calendar_today" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px]" />
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg py-3 pl-10 pr-10 text-[14px] text-[#000000] font-medium focus:outline-none focus:border-[#c6c6cd] transition-colors"
              />
              <Icon name="calendar_month" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px]" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[12px] font-bold text-[#45464d] mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d] font-bold text-[16px]">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg py-3 pl-8 pr-4 text-[14px] text-[#000000] font-medium focus:outline-none focus:border-[#c6c6cd] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Merchant / Description */}
        <div className="mb-6">
          <label className="block text-[12px] font-bold text-[#45464d] mb-2">Merchant / Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={transactionType === 'Expense' ? "e.g. Acme Software Corp" : "e.g. Monthly Salary, Freelance Payment"}
            className="w-full bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg py-3 px-4 text-[14px] text-[#000000] font-medium focus:outline-none focus:border-[#c6c6cd] transition-colors"
          />
        </div>

        {/* Category */}
        <div className="mb-6 relative">
          <label className="block text-[12px] font-bold text-[#45464d] mb-2">Category</label>
          <div
            className={`w-full bg-[#f8f9fa] border ${isCategoryOpen ? 'border-2 border-[#000000]' : 'border border-[#e2e8f0]'} rounded-lg py-3 px-4 text-[14px] text-[#000000] font-medium cursor-pointer flex justify-between items-center transition-colors`}
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <span>{selectedCategory}</span>
            <Icon name="keyboard_arrow_down" className={`text-[#76777d] text-[20px] transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </div>

          {isCategoryOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-50 overflow-hidden py-2">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsCategoryOpen(false);
                  }}
                  className={`px-4 py-3 text-[14px] cursor-pointer transition-colors flex justify-between items-center ${selectedCategory === category
                    ? 'bg-[#6cf8bb] text-[#006c49] font-bold'
                    : 'text-[#45464d] hover:bg-[#f2f4f6]'
                    }`}
                >
                  <span>{category}</span>
                  {selectedCategory === category && <Icon name="check" className="text-[18px]" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="block text-[12px] font-bold text-[#45464d] mb-2">Notes (Optional)</label>
          <textarea
            placeholder="Add any relevant details or tags here..."
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg py-3 px-4 text-[14px] text-[#000000] font-medium focus:outline-none focus:border-[#c6c6cd] transition-colors resize-none"
          ></textarea>
        </div>

        {/* Actions */}
        <div className="border-t border-[#e2e8f0] pt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate('/statements')}
            className="px-6 py-3 rounded-lg border border-[#e2e8f0] text-[#45464d] font-bold text-[14px] hover:bg-[#f8f9fa] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTransaction}
            className="px-6 py-3 rounded-lg bg-[#006c49] text-white font-bold text-[14px] hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
          >
            <Icon name="add" className="text-[18px]" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Right Side: Statement Impact Card */}
      <div className="lg:col-span-4">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-md sticky top-6">
          <h3 className="text-[24px] font-bold text-[#000000] mb-6">Statement Impact</h3>
          <div className="border-t border-[#e2e8f0] mb-6"></div>

          <div className="mb-6">
            <span className="block text-[12px] font-semibold text-[#76777d] mb-1">Current Period</span>
            <span className="text-[18px] font-bold text-[#000000]">October 2023</span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-[#76777d] font-medium">Current Net Cashflow</span>
            <span className="text-[14px] font-bold text-[#000000]">Rp {baseCashflow.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between items-center bg-[#f8f9fa] rounded-lg p-3 mb-6 border border-[#e2e8f0]">
            <span className="text-[12px] text-[#45464d] font-semibold flex items-center gap-2">
              <Icon name="pending_actions" className="text-[16px]" />
              Pending Entry
            </span>
            <span className={`text-[14px] font-bold ${transactionType === 'Expense' ? 'text-[#c8232c]' : 'text-[#006c49]'}`}>
              {transactionType === 'Expense' ? '-' : '+'}Rp {numAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="border-t border-[#e2e8f0] border-dashed mb-6"></div>

          <div className="flex justify-between items-center mb-8">
            <span className="text-[12px] font-bold text-[#45464d] uppercase tracking-wider leading-tight max-w-[100px]">Projected Net Cashflow</span>
            <span className="text-[20px] font-bold text-[#000000]">Rp {projectedCashflow.toLocaleString('id-ID')}</span>
          </div>

          <div>
            <span className="block text-[12px] font-semibold text-[#76777d] mb-2">Cashflow Trend</span>
            <div className="w-full h-3 bg-[#e2e8f0] rounded-full overflow-hidden flex">
              <div
                className={`h-full ${projectedCashflow >= 0 ? 'bg-[#006c49]' : 'bg-[#c8232c]'} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(Math.max((projectedCashflow / 20000000) * 100, 5), 100)}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
);
}
