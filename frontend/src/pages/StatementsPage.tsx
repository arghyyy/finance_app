import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'BSI'];

export default function StatementsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statements, setStatements] = useState<any[]>([]);
  const [persona, setPersona] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ account_id: '', bank_name: 'BCA', file: null as File | null, password: '' });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    filename: string;
    file_type: string;
    file_size: number;
    statement_id: string;
    bank_name: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('uploaded_statements');
    const savedPersona = localStorage.getItem('user_persona');
    if (saved) {
      try {
        setStatements(JSON.parse(saved));
        setIsViewing(false);
      } catch (e) {}
    }
    
    if (savedPersona) {
      setPersona(savedPersona);
    }
    
    // Restore file metadata if available
    const savedFileMeta = localStorage.getItem('uploaded_file_meta');
    if (savedFileMeta) {
      try {
        setUploadedFileMeta(JSON.parse(savedFileMeta));
      } catch (e) {}
    }
    
    const fetchAccountsAndData = async () => {
      try {
        const res = await api.get('/accounts/');
        const accountsData = res.data;
        setAccounts(accountsData);
        
        if (accountsData.length > 0) {
          const lastSelected = localStorage.getItem('last_selected_account_id');
          const defaultAccountId = lastSelected && accountsData.some((a: any) => a.id === lastSelected)
            ? lastSelected
            : accountsData[0].id;
            
          setUploadForm(prev => ({ ...prev, account_id: defaultAccountId }));
          
          if (!saved) {
            // Fetch historical transactions for the default account
            const { data: txData } = await api.get(`/statements/transactions?account_id=${defaultAccountId}`);
            if (txData && txData.length > 0) {
              txData.sort((a: any, b: any) => {
                const d1 = new Date(a.date).getTime();
                const d2 = new Date(b.date).getTime();
                if (d1 !== d2) return d1 - d2;
                
                // Use string comparison for created_at to preserve microsecond precision
                const c1 = a.created_at || '';
                const c2 = b.created_at || '';
                if (c1 < c2) return -1;
                if (c1 > c2) return 1;
                return 0;
              });
              setStatements(txData);
              setIsViewing(true);
            }
          }
        }
      } catch (e) {}
    };
    fetchAccountsAndData();
  }, []);

  const handleResetStatement = async () => {
    // Confirm with user before fully wiping database
    const confirmed = window.confirm("Are you sure you want to delete ALL your transactions and statements from the database? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await api.delete('/statements/transactions');
      
      // Clear local states
      localStorage.removeItem('uploaded_statements');
      localStorage.removeItem('user_persona');
      localStorage.removeItem('uploaded_file_meta');
      setStatements([]);
      setPersona(null);
      setUploadedFileMeta(null);
      setUploadForm(prev => ({ ...prev, file: null, password: '' }));
      setIsConfirmed(false);
      setIsViewing(false);
      
      alert("All transactions and statements have been successfully deleted from the database!");
    } catch(e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('account_id', uploadForm.account_id);
      formData.append('bank_name', uploadForm.bank_name);

      if (uploadForm.password) {
        formData.append('password', uploadForm.password);
      }

      const res = await api.post('/statements/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = res.data;
      setStatements(data.transactions || []);
      setPersona(data.persona);
      localStorage.setItem('uploaded_statements', JSON.stringify(data.transactions || []));
      if (data.persona) {
        localStorage.setItem('user_persona', data.persona);
      }

      // Save file metadata for later bulk-save
      const fileMeta = {
        filename: uploadForm.file!.name,
        file_type: uploadForm.file!.name.split('.').pop()?.toLowerCase() || 'pdf',
        file_size: uploadForm.file!.size,
        statement_id: data.statement_id,
        bank_name: data.detected_bank || uploadForm.bank_name
      };
      setUploadedFileMeta(fileMeta);
      localStorage.setItem('uploaded_file_meta', JSON.stringify(fileMeta));

      setShowUpload(false);
      setIsViewing(false);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message;
      alert('Upload failed: ' + detail);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    try {
      // Retrieve file metadata from state or localStorage
      const fileMeta = uploadedFileMeta || JSON.parse(localStorage.getItem('uploaded_file_meta') || 'null');
      if (!fileMeta?.statement_id) {
        alert('Statement ID tidak ditemukan. Silakan upload ulang e-statement sebelum menyimpan.');
        return;
      }
      
      const payload = {
        account_id: uploadForm.account_id || (accounts.length > 0 ? accounts[0].id : null),
        bank_name: fileMeta.bank_name,
        transactions: statements,
        statement_id: fileMeta.statement_id
      };
      
      const saveResponse = await api.post('/statements/bulk-save', payload);
      const savedAccountId = saveResponse.data.account_id;
      if (!savedAccountId) {
        throw new Error('Backend tidak mengembalikan account_id setelah penyimpanan.');
      }

      localStorage.setItem('last_selected_account_id', savedAccountId);
      setUploadForm(prev => ({ ...prev, account_id: savedAccountId }));
      
      localStorage.removeItem('uploaded_statements');
      localStorage.removeItem('uploaded_file_meta');
      setUploadedFileMeta(null);
      
      // Fetch historical transactions from database
      const { data: txData } = await api.get(`/statements/transactions?account_id=${savedAccountId}`);
      if (txData && txData.length > 0) {
        txData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setStatements(txData);
        setIsViewing(true);
      }
      
      setIsConfirmed(true);
      alert('Transactions saved successfully!');
    } catch (e: any) {
      alert('Error connecting to backend: ' + e.message);
    }
  };

  // Group transactions for the UI
  const grouped = statements.reduce((acc, tx) => {
    const cat = tx.category || 'Pending Categorization';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tx);
    return acc;
  }, {} as Record<string, any[]>);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('refund') || cat.includes('transfer in')) return 'keyboard_return';
    if (cat.includes('software') || cat.includes('subscription')) return 'cloud';
    if (cat.includes('transportation') || cat.includes('ride') || cat.includes('travel')) return 'directions_car';
    if (cat.includes('food') || cat.includes('dining') || cat.includes('coffee')) return 'restaurant';
    if (cat.includes('salary') || cat.includes('income')) return 'payments';
    if (cat.includes('shopping') || cat.includes('ecommerce')) return 'shopping_bag';
    if (cat.includes('pending')) return 'event_note';
    return 'category';
  };

  // Fetch transactions when the selected account changes
  useEffect(() => {
    const isSaved = localStorage.getItem('uploaded_statements');
    if (!isSaved && uploadForm.account_id) {
      api.get(`/statements/transactions?account_id=${uploadForm.account_id}`)
        .then(({ data: txData }) => {
          if (txData && txData.length > 0) {
            txData.sort((a: any, b: any) => {
              const d1 = new Date(a.date).getTime();
              const d2 = new Date(b.date).getTime();
              if (d1 !== d2) return d1 - d2;
              
              const c1 = a.created_at || '';
              const c2 = b.created_at || '';
              if (c1 < c2) return -1;
              if (c1 > c2) return 1;
              return 0;
            });
            setStatements(txData);
            setIsViewing(true);
          } else {
            setStatements([]);
            setIsViewing(false);
          }
        })
        .catch(() => {});
    }
  }, [uploadForm.account_id]);

  const totalIncome = statements.filter(s => s.type === 'CREDIT').reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const totalExpense = statements.filter(s => s.type === 'DEBIT').reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const netCashflow = totalIncome - totalExpense;
  const categorizedCount = statements.filter(s => s.category).length;

  // Find the index of the last transaction that has a balance
  let lastBalanceIdx = -1;
  for (let i = statements.length - 1; i >= 0; i--) {
    if (statements[i].balance != null && statements[i].balance > 0) {
      lastBalanceIdx = i;
      break;
    }
  }

  const selectedAccount = accounts.find(a => a.id === uploadForm.account_id);
  const initialBalance = selectedAccount ? (Number(selectedAccount.initial_balance) || 0) : 0;

  let currentBalance = 0;
  if (lastBalanceIdx !== -1) {
    currentBalance = Number(statements[lastBalanceIdx].balance);
    // Add flow from all transactions AFTER the last known balance
    for (let i = lastBalanceIdx + 1; i < statements.length; i++) {
      const s = statements[i];
      if (s.type === 'CREDIT') {
        currentBalance += (Number(s.amount) || 0);
      } else {
        currentBalance -= (Number(s.amount) || 0);
      }
    }
  } else {
    // For historical view, since we don't save running balances in the DB,
    // currentBalance is Initial Balance + Net Cashflow
    currentBalance = initialBalance + netCashflow;
  }

  const handleDeleteTx = (idx: number) => {
    const updated = [...statements];
    updated.splice(idx, 1);
    setStatements(updated);
    localStorage.setItem('uploaded_statements', JSON.stringify(updated));
  };

  return (
    <div className="flex-1 flex flex-col h-full relative pb-24 bg-[#F8FAFC]">
      {isConfirmed && (
        /* ═══ Success State ═══ */
        <div className="w-full flex flex-col items-center pt-12 pb-10 px-6 font-sans border-b border-gray-200 mb-8 bg-white shadow-sm">
          {/* Party popper icon */}
          <div className="w-16 h-16 bg-[#69f0ae] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <span className="material-symbols-outlined text-[#046c4e] text-[32px]">celebration</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-[32px] md:text-[38px] font-extrabold text-[#1a1a1a] mb-2 text-center tracking-tight">
            Great work, {user?.full_name ? user.full_name.split(' ')[0] : 'Alex'}! Your financial profile<br/>is ready.
          </h1>
          <p className="text-[16px] text-[#6b7280] mb-10 text-center max-w-2xl">
            We've analyzed your data and categorized your monthly trajectory.
          </p>

          <div className="w-full max-w-[900px] flex flex-col gap-6">
            {/* Top Cards row */}
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              {/* Monthly Summary */}
              <div className="flex-1 bg-white rounded-[20px] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-6">Monthly Summary</p>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-500 mb-1">Total Income</p>
                    <p className="text-[20px] xl:text-[24px] font-bold text-[#1a1a1a] mb-2">Rp {totalIncome.toLocaleString('id-ID')}</p>
                    <p className="text-[13px] font-bold text-[#10b981] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span> +4.2%
                    </p>
                  </div>
                  <div className="w-px h-16 bg-gray-200 mt-2 mx-4"></div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-500 mb-1">Total Expenses</p>
                    <p className="text-[20px] xl:text-[24px] font-bold text-[#1a1a1a] mb-2">Rp {totalExpense.toLocaleString('id-ID')}</p>
                    <p className="text-[13px] font-medium text-gray-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">category</span> {categorizedCount} Categories
                    </p>
                  </div>
                  <div className="w-px h-16 bg-gray-200 mt-2 mx-4"></div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-500 mb-1">Net Cashflow</p>
                    <p className="text-[20px] xl:text-[24px] font-bold text-[#10b981] mb-2">{netCashflow >= 0 ? '+' : '-'}Rp {Math.abs(netCashflow).toLocaleString('id-ID')}</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-[#10b981]" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Complete */}
              <div className="w-full lg:w-[280px] shrink-0 bg-white rounded-[20px] p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-[#046c4e]" strokeWidth="4" strokeDasharray="90, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[24px] font-bold text-[#1a1a1a]">90%</span>
                  </div>
                </div>
                <h3 className="text-[14px] font-bold text-[#1a1a1a] mb-1">Profile Complete</h3>
                <p className="text-[12px] text-gray-500">Institutional Verification Passed</p>
              </div>
            </div>

            {/* Persona Card */}
            <div className="w-full bg-[#f4f5f7] rounded-[20px] p-8 border border-gray-200 flex flex-col md:flex-row gap-8 items-center mb-8">
              <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-200">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Persona" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-[#69f0ae] text-[#046c4e] px-3 py-1 rounded-full text-[12px] font-bold tracking-wide">Detected Persona</span>
                  <h2 className="text-[24px] font-bold text-[#1a1a1a]">{persona || 'Freelancer / Consultant'}</h2>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-[#046c4e]">bolt</span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#1a1a1a] mb-1">High software spend</h4>
                      <p className="text-[13px] text-gray-500 leading-relaxed">Your SaaS subscriptions are 15% higher than peers; consider a consolidated business plan.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-[#046c4e]">account_balance_wallet</span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#1a1a1a] mb-1">Consistent monthly transfers</h4>
                      <p className="text-[13px] text-gray-500 leading-relaxed">Strong patterns of transferring 20% to savings indicate disciplined financial health.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#046c4e] text-white px-10 py-3.5 rounded-xl font-bold text-[18px] flex items-center justify-center gap-2 hover:bg-[#03543d] transition-colors shadow-lg shadow-[#046c4e]/30 mt-2 mb-8"
          >
            Go to Dashboard <span className="material-symbols-outlined text-[20px] ml-1">arrow_forward</span>
          </button>
          
          <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">
            Secured by Precise Guardian Encryption
          </p>
        </div>
      )}

      {statements.length === 0 ? (
        /* ═══ Empty State ═══ */
        <div className="flex-1 flex flex-col max-w-container-max w-full mx-auto">

          {/* ─── Page Header ─── */}
          <header className="mb-lg md:mb-xl flex items-center justify-between">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
                Statements
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Manage your financial records and transactions.
              </p>
            </div>
          </header>


            <div className="flex-1 flex items-center justify-center w-full min-h-[400px]">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] w-full max-w-2xl p-lg md:p-2xl flex flex-col items-center text-center relative overflow-hidden ambient-grid">
                {/* Top decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-surface-container-lowest to-transparent z-0" />

                {/* Graphic / Illustration */}
                <div className="relative z-10 mb-xl flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
                  {/* Soft concentric rings */}
                  <div className="absolute inset-0 bg-primary-fixed rounded-full opacity-20 scale-110 animate-pulse" style={{ animationDuration: '4s' }} />
                  <div className="absolute inset-4 bg-primary-container rounded-full opacity-5" />
                  {/* Primary Icon */}
                  <div className="bg-surface-container-lowest rounded-full p-md shadow-sm border border-outline-variant/50 relative z-20 flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
                    <span className="material-symbols-outlined text-[48px] md:text-[56px] text-primary-container" style={{ fontVariationSettings: "'wght' 200" }}>
                      folder_open
                    </span>
                  </div>
                </div>

                {/* Copy */}
                <div className="relative z-10 max-w-md mx-auto space-y-sm mb-xl">
                  <h3 className="font-headline-md text-headline-md text-on-surface">No transactions found</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    To get started, upload your bank statement or add a transaction manually.
                  </p>
                  <p className="font-body-sm text-body-sm text-surface-tint mt-md pt-sm border-t border-outline-variant/30">
                    <span className="material-symbols-outlined text-[16px] inline-block align-text-bottom mr-xs text-secondary">
                      auto_awesome
                    </span>
                    Automatically categorize expenses and predict your financial persona.
                  </p>
                </div>

                {/* Actions */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-md w-full sm:w-auto mt-auto">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-sm bg-[#10b981] text-white font-label-md text-label-md px-lg py-sm rounded-lg hover:opacity-90 transition-all shadow-[0px_2px_10px_rgba(0,0,0,0.1)] active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    Upload E-Statement
                  </button>
                  <button
                    onClick={() => navigate('/statements/manual')}
                    className="w-full sm:w-auto flex items-center justify-center gap-sm bg-primary text-white font-label-md text-label-md px-lg py-sm rounded-lg hover:opacity-90 transition-all active:scale-95 border border-none"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Manual Entry
                  </button>
                </div>
              </div>
            </div>
        </div>
      ) : (
        /* ═══ Review Transactions Layout (from screenshot) ═══ */
        <div className="max-w-[1440px] 2xl:max-w-[1600px] w-full mx-auto px-md lg:px-xl py-lg">
          {/* Header */}
          <div className="mb-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <p className="font-label-md text-on-surface-variant font-medium uppercase tracking-wider mb-xs">Transaction Details</p>
              <h2 className="text-[32px] font-bold text-on-surface mb-xs">Review Transactions</h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl">
                Please review the categorized transactions below. We've highlighted a few items that need your attention before finalizing the statement.
              </p>
            </div>
            <div className="flex flex-wrap gap-sm w-full md:w-auto">
              <button
                onClick={() => setShowUpload(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-[#10b981] text-white font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Upload New
              </button>
              <button
                onClick={handleResetStatement}
                className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-red-50 text-red-600 border border-red-200 font-label-md text-label-md px-md py-sm rounded-lg hover:bg-red-100 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Reset / Delete Data
              </button>
              <button
                onClick={() => navigate('/statements/manual')}
                className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-slate-800 text-white font-label-md text-label-md px-md py-sm rounded-lg hover:bg-slate-700 transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Manually
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-xl pb-10">
            {/* Left Column (Table) */}
            <div className="flex-1 overflow-x-auto bg-white rounded-xl border border-outline-variant/60 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-[#F0F4F9]">
                  <tr>
                    <th className="px-4 py-3 border-r-[2px] border-white align-top text-center w-16">
                      <div className="font-bold text-[#0f172a] text-[14px]">No</div>
                      <div className="italic font-normal text-[#64748b] text-[13px]">No</div>
                    </th>
                    <th className="px-4 py-3 border-r-[2px] border-white align-top w-36">
                      <div className="font-bold text-[#0f172a] text-[14px]">Tanggal</div>
                      <div className="italic font-normal text-[#64748b] text-[13px]">Date</div>
                    </th>
                    <th className="px-4 py-3 border-r-[2px] border-white align-top">
                      <div className="font-bold text-[#0f172a] text-[14px]">Keterangan</div>
                      <div className="italic font-normal text-[#64748b] text-[13px]">Remarks</div>
                    </th>
                    <th className="px-4 py-3 border-r-[2px] border-white align-top text-center w-40">
                      <div className="font-bold text-[#0f172a] text-[14px]">Nominal (IDR)</div>
                      <div className="italic font-normal text-[#64748b] text-[13px]">Amount (IDR)</div>
                    </th>
                    <th className="px-4 py-3 border-r-[2px] border-white align-top text-center w-40">
                      <div className="font-bold text-[#0f172a] text-[14px]">Saldo (IDR)</div>
                      <div className="italic font-normal text-[#64748b] text-[13px]">Balance (IDR)</div>
                    </th>
                    <th className="px-4 py-3 align-top w-48 text-center">
                      <div className="font-bold text-[#0f172a] text-[14px]">Kategori</div>
                      <div className="italic font-normal text-[#64748b] text-[13px]">Category</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((tx: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100/50 hover:bg-gray-50/50 cursor-pointer group" onClick={() => setSelectedTx(tx)}>
                      <td className="px-4 py-4 align-top text-center">
                        <span className="text-[14px] text-[#0f172a]">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="text-[14px] text-[#0f172a] whitespace-pre-wrap leading-relaxed">
                          {(() => {
                            const dStr = tx.date || '';
                            if (dStr.includes('/')) return dStr.split('/').slice(0, 2).join('/');
                            const d = new Date(dStr);
                            if (!isNaN(d.getTime())) {
                              const dd = String(d.getDate()).padStart(2, '0');
                              const mm = String(d.getMonth() + 1).padStart(2, '0');
                              return `${dd}/${mm}`;
                            }
                            return dStr;
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="text-[14px] text-[#0f172a] whitespace-pre-wrap leading-relaxed">
                          {tx.description.replace(/\n/g, '\n')}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-center">
                        <span className={`text-[14px] font-bold ${tx.type === 'CREDIT' ? 'text-[#10b981]' : 'text-[#0f172a]'}`}>
                          {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-center">
                        <span className="text-[14px] font-bold text-[#1d4ed8]">
                          {tx.balance != null ? tx.balance.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button className="w-full flex items-center justify-between border border-outline-variant px-md py-1.5 rounded-full text-[13px] font-medium text-on-surface-variant hover:bg-surface-container transition-colors bg-white shadow-sm">
                            <span className="truncate">{tx.category || 'Select Category'}</span>
                            <span className="material-symbols-outlined text-[16px] ml-xs">expand_more</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTx(idx); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Column (Insight) */}
            <div className="w-full lg:w-[360px] shrink-0 space-y-lg">
              {/* AI Persona Card */}
              <div className="bg-[#f3f4f6] rounded-2xl p-xl border border-outline-variant/60 relative overflow-hidden">
                <span className="material-symbols-outlined absolute -top-4 -right-4 text-[140px] text-black/[0.03] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance
                </span>

                <div className="flex items-center gap-xs text-on-surface-variant mb-lg relative z-10">
                  <span className="material-symbols-outlined text-[20px] text-[#10b981]">psychology</span>
                  <span className="font-label-sm tracking-widest uppercase font-bold text-on-surface-variant/80">AI Insight</span>
                </div>

                <div className="relative z-10 mb-xl">
                  <h3 className="font-headline-md text-on-surface mb-xs">Detected Persona:</h3>
                  <h2 className="text-[32px] font-bold text-[#10b981] leading-tight mb-md">{persona || 'Analyzing...'}</h2>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">
                    Based on transaction frequency and vendor types, our model recognizes patterns consistent with {persona?.toLowerCase().includes('employee') ? 'a salaried employee' : persona?.toLowerCase() || 'freelance'} operations.
                  </p>
                </div>

                <div className="pt-md border-t border-outline-variant/60 relative z-10 flex items-start gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-on-surface mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="font-label-sm text-on-surface font-semibold leading-tight">Optimizing categorizations for accurate financial analysis.</p>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/60 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
                <p className="font-label-md text-on-surface-variant mb-md">Review Progress</p>
                <div className="h-2.5 bg-surface-container rounded-full overflow-hidden mb-sm">
                  <div className="h-full bg-[#10b981] rounded-full transition-all duration-500" style={{ width: `${Math.max(5, (categorizedCount / statements.length) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-label-sm">
                  <span className="text-on-surface-variant font-medium">Categorized</span>
                  <span className="font-bold text-on-surface">{categorizedCount} / {statements.length} items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Fixed Bar */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-surface-container-lowest border-t border-outline-variant px-lg py-4 flex flex-col md:flex-row items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-40">
            <div className="flex items-center gap-xl mb-4 md:mb-0">
              <div>
                <p className="font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Income</p>
                <p className="text-[18px] md:text-[20px] font-bold text-on-surface">Rp {totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Expenses</p>
                <p className="text-[18px] md:text-[20px] font-bold text-on-surface">Rp {totalExpense.toLocaleString('id-ID')}</p>
              </div>
              <div className="hidden md:block border-l border-outline-variant/60 pl-xl">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Net Cashflow</p>
                <p className={`text-[20px] md:text-[24px] font-bold ${netCashflow >= 0 ? 'text-[#10b981]' : 'text-error'}`}>
                  {netCashflow >= 0 ? '+' : '-'}Rp {Math.abs(netCashflow).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="hidden lg:block border-l border-outline-variant/60 pl-xl">
                <p className="font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Current Balance</p>
                <p className="text-[20px] md:text-[24px] font-bold text-[#3b82f6]">
                  Rp {currentBalance.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            {!isViewing && (
              <div className="flex gap-md w-full md:w-auto">
                <button className="flex-1 md:flex-none px-xl py-2.5 rounded-lg border border-outline-variant font-label-md font-bold text-on-surface hover:bg-surface-container transition-colors">
                  Save Draft
                </button>
                  <button 
                  onClick={handleConfirmAndSave}
                  className="flex-1 md:flex-none px-xl py-2.5 rounded-lg bg-[#10b981] text-white font-label-md font-bold flex items-center justify-center gap-xs hover:opacity-90 transition-opacity shadow-sm">
                  Confirm & Continue
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Text View Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-xl py-lg border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                <h3 className="font-headline-sm text-on-surface">Original Extraction</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            
            <div className="p-xl overflow-y-auto">
              <div className="mb-lg">
                <p className="font-label-md text-on-surface-variant mb-xs">Parsed Details</p>
                <div className="grid grid-cols-2 gap-md bg-surface-container p-md rounded-xl">
                  <div>
                    <span className="text-[12px] text-on-surface-variant uppercase font-bold tracking-widest">Date</span>
                    <p className="font-body-md text-on-surface font-medium mt-0.5">{selectedTx.date}</p>
                  </div>
                  <div>
                    <span className="text-[12px] text-on-surface-variant uppercase font-bold tracking-widest">Amount</span>
                    <p className="font-body-md text-on-surface font-medium mt-0.5">{selectedTx.type === 'CREDIT' ? '+' : '-'}Rp {selectedTx.amount.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[12px] text-on-surface-variant uppercase font-bold tracking-widest">Description</span>
                    <p className="font-body-md text-on-surface font-medium mt-0.5">{selectedTx.description}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-label-md text-on-surface-variant mb-xs flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">terminal</span>
                  Raw PDF Text
                </p>
                <div className="bg-[#1e1e1e] rounded-xl p-md overflow-x-auto border border-outline-variant/30">
                  <pre className="font-mono text-[13px] text-[#a6accd] leading-relaxed whitespace-pre-wrap">
                    {selectedTx.raw_text || "No raw text available for this transaction."}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="px-xl py-md border-t border-outline-variant bg-surface-container-low flex justify-end">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-lg py-2 bg-primary text-white font-label-md rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Upload Modal ─── */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}>
          <div className="bg-surface-container-lowest rounded-xl p-lg md:p-xl max-w-lg w-full border border-outline-variant shadow-modal">
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-headline-md text-headline-md text-on-surface">Upload E-Statement</h3>
              <button onClick={() => setShowUpload(false)} className="text-on-surface-variant hover:text-on-surface p-sm rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Bank selector */}
            <div className="mb-md">
              <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">Pilih Bank</label>
              <select
                value={uploadForm.bank_name}
                onChange={(e) => setUploadForm({ ...uploadForm, bank_name: e.target.value })}
                className="w-full bg-surface-container rounded-lg px-md py-sm border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
              >
                <option value="BCA">BCA</option>
                <option value="BRI">BRI</option>
                <option value="BNI">BNI</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BSI">BSI</option>
                <option value="BTN">BTN</option>
              </select>
            </div>

            {/* Password input for locked PDFs */}
            <div className="mb-md">
              <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">
                Password (Optional - for locked E-Statements)
              </label>
              <input
                type="password"
                placeholder="e.g. DDMMYYYY or your bank password"
                value={uploadForm.password}
                onChange={(e) => setUploadForm({ ...uploadForm, password: e.target.value })}
                className="w-full bg-surface-container rounded-lg px-md py-sm border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); setUploadForm({ ...uploadForm, file: e.dataTransfer.files[0] }); }}
              className={`border-2 border-dashed rounded-lg p-xl text-center transition-colors cursor-pointer
                ${dragging ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-on-surface-variant/40'}`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {uploadForm.file ? (
                <div className="space-y-sm">
                  <span className="material-symbols-outlined text-[40px] text-secondary">description</span>
                  <p className="font-body-md text-body-md font-medium text-on-surface">{uploadForm.file.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setUploadForm({ ...uploadForm, file: null }); }}
                    className="font-label-md text-label-md text-error hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-sm">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant">upload_file</span>
                  <p className="font-body-md text-body-md font-medium text-on-surface">Drop your e-statement here</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">PDF, CSV, or Excel files accepted</p>
                </div>
              )}
              <input id="file-input" type="file" accept=".pdf,.csv,.xlsx,.xls" className="hidden"
                onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })} />
            </div>

            {/* Actions */}
            <div className="flex gap-md justify-end mt-lg">
              <button
                onClick={() => setShowUpload(false)}
                className="px-lg py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!uploadForm.file || uploading}
                onClick={handleUpload}
                className="flex items-center gap-sm px-lg py-sm rounded-lg font-label-md text-label-md bg-[#10b981] text-white hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                )}
                {uploading ? 'Analyzing...' : 'Upload & Analyze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Ambient grid style ─── */}
      <style>{`
        .ambient-grid {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(118, 119, 125, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(118, 119, 125, 0.05) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
