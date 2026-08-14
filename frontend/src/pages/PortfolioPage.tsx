import React, { useState } from 'react';

// ─── Inline SVG Icons ───────────────────────────────────────────────────
const Icon = ({ name, className = '', fill = false }: { name: string; className?: string; fill?: boolean }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: fill ? "'FILL' 1" : undefined }}
  >
    {name}
  </span>
);

// ─── Types ──────────────────────────────────────────────────────────────
interface HoldingItem {
  id: string;
  name: string;
  symbol: string;
  category: string;
  allocation: number;
  value: number;
  status: 'optimal' | 'overweight' | 'underweight';
  icon: string;
  iconBg: string;
}

// ─── Component ──────────────────────────────────────────────────────────
const PortfolioPage: React.FC = () => {
  const [chartPeriod, setChartPeriod] = useState('vs S&P 500');
  const [isNewUser, setIsNewUser] = useState(true);
  const [idleCash, setIdleCash] = useState(0);

  const [holdings] = useState<HoldingItem[]>([
    {
      id: '1', name: 'BBCA (Bank Central Asia)', symbol: 'BBCA',
      category: 'Equity', allocation: 42.5, value: 150000000,
      status: 'overweight', icon: 'domain', iconBg: 'bg-[#131b2e] text-white',
    },
    {
      id: '2', name: 'Obligasi Negara Ritel', symbol: 'ORI023',
      category: 'Bonds', allocation: 20.0, value: 80000000,
      status: 'optimal', icon: 'account_balance', iconBg: 'bg-[#565e74] text-white',
    },
    {
      id: '3', name: 'Bitcoin', symbol: 'BTC',
      category: 'Crypto', allocation: 15.0, value: 50000000,
      status: 'optimal', icon: 'currency_bitcoin', iconBg: 'bg-[#bec6e0] text-[#131b2e]',
    },
  ]);

  React.useEffect(() => {
    const saved = localStorage.getItem('uploaded_statements');
    if (saved) {
      try {
        const txs = JSON.parse(saved);
        if (txs && txs.length > 0) {
          setIsNewUser(false);
          // Cari saldo terakhir yang valid dari transaksi
          let lastBalance = 0;
          for (let i = txs.length - 1; i >= 0; i--) {
            if (txs[i].balance) {
              lastBalance = parseFloat(txs[i].balance);
              break;
            }
          }
          if (lastBalance === 0) {
            // Jika PDF parser gagal membaca balance, jadikan total income - total expense sebagai proxy
            let t = 0;
            txs.forEach((tx: any) => {
              if (tx.amount) t += tx.amount;
            });
            lastBalance = t > 0 ? t : 25000000;
          }
          setIdleCash(lastBalance);
        }
      } catch (e) {}
    }
  }, []);

  const totalHoldings = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalPortfolioValue = totalHoldings + idleCash;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      optimal: 'bg-[#e0e3e5] text-[#45464d]',
      overweight: 'bg-[#ffddb8] text-[#2a1700]',
      underweight: 'bg-[#ffdad6] text-[#93000a]',
    };
    return (
      <span className={`inline-block px-1 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.optimal}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (n: number) =>
    'Rp ' + n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (isNewUser) {
    return (
      <div className="max-w-container-max mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-[32px] font-bold text-[#000000] tracking-tight">Portfolio Overview</h2>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px]" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="w-full bg-[#f2f4f6] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#131b2e]/30"
              />
            </div>
            <button className="w-10 h-10 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center transition-colors text-[#45464d]">
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center transition-colors text-[#45464d]">
              <Icon name="help" className="text-[20px]" />
            </button>
          </div>
        </div>

        {/* Empty State Hero */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8 md:p-12 flex flex-col md:flex-row items-center justify-between overflow-hidden relative min-h-[400px]">
          <div className="max-w-xl z-10 relative">
            <span className="inline-block bg-[#6cf8bb] text-[#006c49] text-[10px] font-bold px-2 py-1 rounded mb-6 uppercase tracking-wider">
              Initialization Required
            </span>
            <h1 className="text-[40px] md:text-[48px] font-bold text-[#000000] leading-tight mb-4 tracking-tight">
              Welcome to your<br />Portfolio
            </h1>
            <p className="text-[16px] text-[#45464d] mb-8 max-w-md leading-relaxed">
              Your institutional-grade investment overview starts here. Connect your accounts or upload a statement to begin tracking your wealth across all asset classes with precision.
            </p>
            <div className="flex gap-4">
              <button className="bg-[#000000] text-white hover:opacity-90 px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-opacity shadow-lg">
                <Icon name="account_balance" className="text-[18px]" />
                Link Bank Account
              </button>
              <button className="bg-white text-[#000000] border border-[#c6c6cd] hover:bg-[#f2f4f6] px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors">
                <Icon name="upload_file" className="text-[18px]" />
                Upload E-Statement
              </button>
            </div>
          </div>
          
          {/* Circular Graphic */}
          <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#10b981]/20"></div>
            <div className="absolute w-[280px] h-[280px] rounded-full border border-[#10b981]/30"></div>
            <div className="absolute w-[160px] h-[160px] bg-[#f2f4f6] rounded-full flex items-center justify-center">
              <Icon name="account_balance_wallet" className="text-[#a0aab5] text-[64px]" />
            </div>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Total Portfolio Value Skeleton */}
          <div className="col-span-1 md:col-span-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col h-[280px]">
            <div className="flex justify-between items-start mb-4">
              <div className="text-[14px] text-[#45464d]">Total Portfolio Value</div>
            </div>
            <div className="text-[48px] font-bold text-[#000000] mb-8 leading-none">$0</div>
            <div className="mt-auto border-t border-[#e2e8f0] pt-4">
              <div className="text-[12px] italic text-[#76777d]">Waiting for data connection...</div>
            </div>
          </div>
          
          {/* Asset Allocation Empty State */}
          <div className="col-span-1 md:col-span-8 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 h-[280px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[20px] font-bold text-[#000000]">Asset Allocation</h3>
              <Icon name="more_vert" className="text-[#76777d]" />
            </div>
            <div className="flex-1 flex items-center px-8">
              <div className="w-32 h-32 rounded-full border-[16px] border-[#f2f4f6] flex items-center justify-center">
                <span className="text-[14px] font-semibold text-[#76777d]">0%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Holdings Skeleton */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col min-h-[200px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-bold text-[#000000]">Detailed Holdings</h3>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-[#f2f4f6] text-[12px] font-semibold text-[#45464d] rounded">Export</div>
              <div className="px-3 py-1 bg-[#f2f4f6] text-[12px] font-semibold text-[#45464d] rounded">Filters</div>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0] text-[10px] font-bold tracking-wider text-[#76777d]">
                <th className="py-3 uppercase">Asset Name</th>
                <th className="py-3 uppercase">Type</th>
                <th className="py-3 uppercase text-right">Holdings</th>
                <th className="py-3 uppercase text-right">Price</th>
                <th className="py-3 uppercase text-right">Performance</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty body */}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto">
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* Header Section */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
        <div>
          <h2 className="text-[24px] md:text-[32px] font-semibold text-[#000000] tracking-tight mb-1">
            Portfolio Overview
          </h2>
          <p className="text-[16px] text-[#45464d]">Your asset allocation and performance metrics.</p>
        </div>
        <div className="flex gap-3">
          {/* <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#eceef0] border border-[#c6c6cd] rounded-full text-[12px] font-semibold tracking-wider text-[#45464d]">
            <Icon name="shield" className="text-[14px] text-[#006c49]" />
            Risk Profile: Moderate-Aggressive
          </span> */}
          <button className="bg-[#006c49] text-white hover:opacity-90 transition-colors px-4 py-2 rounded-lg text-[12px] font-semibold tracking-wider flex items-center gap-1 shadow-sm">
            <Icon name="Download" className="text-[14px]" />
            Report
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* KPI Row */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-xl">

        {/* Total Portfolio Value */}
        <div className="bg-white/95 backdrop-blur rounded-xl border border-[#E2E8F0] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon name="account_balance_wallet" className="text-[64px]" />
          </div>
          <p className="text-[14px] text-[#45464d] mb-1">Total Portfolio Value</p>
          <div className="text-[32px] md:text-[40px] font-bold text-[#000000] leading-[1.2] tracking-[-0.02em] mb-4">
            {formatCurrency(totalPortfolioValue)}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center text-[#006c49] text-[14px] font-medium bg-[#6cf8bb]/20 px-2 py-0.5 rounded">
              <Icon name="arrow_upward" className="text-[14px] mr-1" />
              +Rp 1.450.500 (1.01%)
            </span>
            <span className="text-[14px] text-[#45464d]">Past 24h</span>
          </div>
        </div>

        {/* All-Time Return */}
        <div className="bg-white/95 backdrop-blur rounded-xl border border-[#E2E8F0] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-6">
          <p className="text-[14px] text-[#45464d] mb-1">All-Time Return</p>
          <div className="text-[24px] font-semibold text-[#000000] mb-4">+Rp 45.120.000</div>
          <div className="flex items-center gap-2">
            <span className="flex items-center text-[#006c49] text-[14px] font-medium bg-[#6cf8bb]/20 px-2 py-0.5 rounded">
              <Icon name="trending_up" className="text-[14px] mr-1" />
              +38.4%
            </span>
          </div>
          {/* Mini sparkline */}
          <div className="mt-4 h-8 w-full bg-gradient-to-r from-[#eceef0] to-[#6cf8bb]/30 rounded-sm relative">
            <svg className="w-full h-full text-[#006c49]" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path d="M0,20 Q10,15 20,18 T40,10 T60,12 T80,5 T100,2"
                fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Tactical Alert */}
        <div className="bg-white/95 backdrop-blur rounded-xl border border-[#E2E8F0] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-6 border-l-4 border-l-[#ffb95f] bg-gradient-to-br from-white to-[#ffddb8]/10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[14px] font-semibold text-[#b87500] flex items-center gap-1">
              <Icon name="warning" className="text-[18px]" />
              Tactical Advice
            </p>
            <span className="bg-[#ffddb8] text-[#2a1700] px-1 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Action Needed
            </span>
          </div>
          <p className="text-[14px] text-[#45464d] mb-4">
            Equities are <strong className="text-[#000000]">Overweight by 8%</strong> following recent market rallies.
            Consider rebalancing to maintain risk profile.
          </p>
          <button
            className="w-full bg-[#10B981] text-white hover:opacity-90 transition-colors py-2 rounded-lg text-[12px] font-semibold tracking-wider shadow-sm"
          >
            Secure Profits (Sell ~30%)
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* Main Bento Grid */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-6 mb-xl">

        {/* ─── Asset Allocation Donut ─── */}
        <div className="col-span-12 lg:col-span-5 bg-white/95 backdrop-blur rounded-xl border border-[#E2E8F0] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-6 flex flex-col h-[400px]">
          <h3 className="text-[24px] font-semibold text-[#000000] mb-6">Asset Allocation</h3>
          <div className="flex-grow flex items-center justify-center relative">
            {/* CSS Donut Chart */}
            <div
              className="relative w-48 h-48 rounded-full flex items-center justify-center"
              style={{
                background: 'conic-gradient(#131b2e 0% 55%, #006c49 55% 75%, #bec6e0 75% 90%, #e0e3e5 90% 100%)',
              }}
            >
              <div className="absolute w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-[14px] text-[#45464d]">Equities</span>
                <span className="text-[24px] font-semibold text-[#000000]">55%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { label: 'Stocks (55%)', color: 'bg-[#131b2e]' },
              { label: 'Bonds (20%)', color: 'bg-[#006c49]' },
              { label: 'Crypto (15%)', color: 'bg-[#bec6e0]' },
              { label: 'Cash (10%)', color: 'bg-[#e0e3e5]' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                <span className="text-[14px] text-[#45464d]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Risk vs Return Chart ─── */}
        <div className="col-span-12 lg:col-span-7 bg-white/95 backdrop-blur rounded-xl border border-[#E2E8F0] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-6 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[24px] font-semibold text-[#000000]">Risk vs. Return</h3>
            <select
              value={chartPeriod}
              onChange={e => setChartPeriod(e.target.value)}
              className="bg-[#eceef0] border-none rounded-md text-[14px] py-1 px-2 pr-5 focus:ring-1 focus:ring-[#c6c6cd] outline-none"
            >
              <option>vs IHSG</option>
              <option>vs LQ45</option>
            </select>
          </div>

          <div className="flex-grow relative w-full border-b border-l border-[#c6c6cd]/50 pb-2 pl-2">
            {/* Y Axis */}
            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#76777d] py-2 h-full w-5 text-right pr-1">
              <span>15%</span>
              <span>10%</span>
              <span>5%</span>
              <span>0%</span>
            </div>
            {/* X Axis */}
            <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[10px] text-[#76777d] px-2">
              <span>Low Risk</span>
              <span>Med Risk</span>
              <span>High Risk</span>
            </div>

            {/* Chart area */}
            <div className="absolute inset-0 pl-2 pb-2">
              {/* Grid lines */}
              <div className="w-full h-1/3 border-t border-[#c6c6cd]/20 border-dashed" />
              <div className="w-full h-1/3 border-t border-[#c6c6cd]/20 border-dashed" />
              <div className="w-full h-1/3 border-t border-[#c6c6cd]/20 border-dashed" />

              {/* Benchmark line */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 L50,50 L100,30" fill="none" stroke="#c6c6cd" strokeDasharray="4" strokeWidth="2" />
              </svg>

              {/* Portfolio line */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#131b2e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#131b2e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,90 Q30,60 50,40 T100,10" fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="3" />
                <path d="M0,100 L0,90 Q30,60 50,40 T100,10 L100,100 Z" fill="url(#chartGrad)" />
                <circle className="animate-pulse" cx="80" cy="20" fill="#006c49" r="4" />
              </svg>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#76777d]">
              <div className="w-2 h-2 rounded-full bg-[#131b2e]" /> Portfolio
            </span>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#76777d]">
              <div className="w-2 h-2 rounded-full bg-[#c6c6cd]" /> Benchmark
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* Holdings Table & Idle Cash Widget Row */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-6 mb-xl">
        {/* ─── Holdings Table ─── */}
        <div className="col-span-12 lg:col-span-8 bg-white/95 backdrop-blur rounded-xl border border-[#E2E8F0] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[24px] font-semibold text-[#000000]">Detailed Holdings</h3>
            <button className="text-[#006c49] text-[16px] font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c6c6cd]/50 text-[#76777d] text-[12px] font-semibold tracking-wider">
                  <th className="py-2 font-semibold">Asset</th>
                  <th className="py-2 font-semibold">Category</th>
                  <th className="py-2 font-semibold text-right">Allocation</th>
                  <th className="py-2 font-semibold text-right">Value</th>
                  <th className="py-2 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {holdings.map(h => (
                  <tr key={h.id} className="border-b border-[#c6c6cd]/30 hover:bg-[#f2f4f6] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${h.iconBg} flex items-center justify-center`}>
                          <Icon name={h.icon} className="text-[16px]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#000000]">{h.name}</div>
                          <div className="text-[10px] text-[#76777d]">{h.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#45464d]">{h.category}</td>
                    <td className="py-3 text-right font-medium text-[14px]">{h.allocation}%</td>
                    <td className="py-3 text-right font-medium text-[14px]">{formatCurrency(h.value)}</td>
                    <td className="py-3 text-center">{statusBadge(h.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Idle Cash Widget ─── */}
        <div className="col-span-12 lg:col-span-4 bg-white/95 backdrop-blur rounded-xl border border-[#E2E8F0] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-6 bg-[#ffffff]">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="savings" className="text-[24px] text-[#006c49]" />
            <h3 className="text-[24px] font-semibold text-[#000000]">Idle Cash</h3>
          </div>
          <div className="mb-6">
            <p className="text-[14px] text-[#45464d] mb-1">Available 'Buy the Dip' Funds</p>
            <div className="text-[30px] font-bold text-[#000000] tracking-[-0.02em]">{formatCurrency(idleCash)}</div>
          </div>
          <div className="bg-[#f7f9fb] p-4 rounded-lg border border-[#c6c6cd]/30 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-semibold tracking-wider text-[#45464d]">Recommended Parking</span>
              <span className="text-[#006c49] text-[12px] bg-[#6cf8bb]/20 px-1 py-0.5 rounded">+4.5% APY</span>
            </div>
            <div className="text-[16px] font-semibold text-[#000000] mb-1">Reksa Dana Pasar Uang</div>
            <p className="text-[11px] text-[#76777d]">Highly liquid instrument for short-term capital preservation.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-[#f7f9fb] border border-[#c6c6cd] hover:bg-[#eceef0] transition-colors py-2 rounded-lg text-[12px] font-semibold tracking-wider text-[#000000]">
              Transfer
            </button>
            <button className="flex-1 bg-[#10B981] text-white hover:opacity-90 transition-colors py-2 rounded-lg text-[12px] font-semibold tracking-wider shadow-sm">
              Invest Cash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
