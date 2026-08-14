import React, { useState } from 'react';

const InvestmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'allocation' | 'strategy' | 'performance'>('allocation');
  const [isYearly, setIsYearly] = useState(false);

  const holdings = [
    { asset: 'US Large Cap', allocation: 35, amount: 87500, color: 'bg-secondary' },
    { asset: 'International Equity', allocation: 18, amount: 45000, color: 'bg-secondary-fixed-dim' },
    { asset: 'Emerging Markets', allocation: 10, amount: 25000, color: 'bg-tertiary-fixed-dim' },
    { asset: 'Fixed Income', allocation: 20, amount: 50000, color: 'bg-primary-container' },
    { asset: 'REITs', allocation: 10, amount: 25000, color: 'bg-surface-variant' },
    { asset: 'Cash & Equivalents', allocation: 7, amount: 17500, color: 'bg-outline-variant' },
  ];

  const strategies = [
    {
      name: 'Moderate Growth',
      risk: 'Moderate',
      return: '8-10%',
      description: 'Balanced allocation between equities and fixed income for steady growth.',
      recommended: true,
    },
    {
      name: 'Aggressive Growth',
      risk: 'High',
      return: '12-15%',
      description: 'Higher equity exposure targeting maximum long-term capital appreciation.',
      recommended: false,
    },
    {
      name: 'Conservative Income',
      risk: 'Low',
      return: '4-6%',
      description: 'Fixed-income focused strategy prioritizing capital preservation and income.',
      recommended: false,
    },
  ];

  return (
    <div className="space-y-xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">Investment Strategy</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Define your investment approach, monitor allocations, and optimize returns.</p>
        </div>
        <button className="flex items-center gap-md px-lg py-md bg-secondary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity active:scale-95 duration-150">
          <span className="material-symbols-outlined">assessment</span>
          <span>Run Analysis</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm">Total Invested</p>
          <p className="font-headline-md text-headline-md text-primary font-bold">$250,000</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Current portfolio value</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm">Annual Return</p>
          <p className="font-headline-md text-headline-md text-secondary font-bold">+$24,500</p>
          <p className="font-body-sm text-body-sm text-secondary mt-xs">+9.8% YTD</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm">Risk Score</p>
          <p className="font-headline-md text-headline-md text-primary font-bold">6.8/10</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Moderate-High</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm">Dividend Yield</p>
          <p className="font-headline-md text-headline-md text-primary font-bold">2.4%</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">$6,000 annual income</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-md border-b border-outline-variant">
        {(['allocation', 'strategy', 'performance'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-sm px-md font-label-md text-label-md uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'text-secondary border-b-2 border-secondary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab === 'allocation' ? 'Asset Allocation' : tab === 'strategy' ? 'Strategy Builder' : 'Performance'}
          </button>
        ))}
      </div>

      {/* Allocation Tab */}
      {activeTab === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Donut + Legend */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-lg">Current Allocation</h3>
            <div className="flex flex-col md:flex-row items-center gap-xl">
              {/* Donut Chart */}
              <div className="relative w-56 h-56 flex-shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#e0e3e5" strokeWidth="10" />
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#006c49" strokeWidth="10"
                    strokeDasharray={`${(35 / 100) * 283} 283`} strokeDashoffset="0" />
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#4edea3" strokeWidth="10"
                    strokeDasharray={`${(18 / 100) * 283} 283`} strokeDashoffset={`${-(35 / 100) * 283}`} />
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#ffb95f" strokeWidth="10"
                    strokeDasharray={`${(10 / 100) * 283} 283`} strokeDashoffset={`${-(53 / 100) * 283}`} />
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#bec6e0" strokeWidth="10"
                    strokeDasharray={`${(20 / 100) * 283} 283`} strokeDashoffset={`${-(63 / 100) * 283}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-headline-md text-headline-md font-bold text-primary">$250K</p>
                    <p className="font-label-md text-label-md text-on-surface-variant">Total</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-3 w-full">
                {holdings.map(h => (
                  <div key={h.asset} className="flex items-center justify-between">
                    <div className="flex items-center gap-md">
                      <div className={`w-3 h-3 rounded-full ${h.color}`} />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{h.asset}</span>
                    </div>
                    <div className="flex items-center gap-lg">
                      <span className="font-data-tabular text-data-tabular font-bold text-primary w-16 text-right">${h.amount.toLocaleString()}</span>
                      <span className="font-data-tabular text-data-tabular text-on-surface-variant w-10 text-right">{h.allocation}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Allocation Insights */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-lg">Allocation Insights</h3>
            <div className="space-y-lg">
              <div className="bg-surface-container-low rounded-lg p-md">
                <div className="flex items-center gap-sm mb-sm">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                  <span className="font-body-md text-body-md font-semibold text-primary">Well Diversified</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Your portfolio spans 6 asset classes with low correlation.</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-md">
                <div className="flex items-center gap-sm mb-sm">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim">info</span>
                  <span className="font-body-md text-body-md font-semibold text-primary">Rebalancing Due</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">US Large Cap has drifted 5% above target. Consider rebalancing.</p>
              </div>
              <button className="w-full py-sm px-md bg-secondary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity">
                View Detailed Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Builder Tab */}
      {activeTab === 'strategy' && (
        <div className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {strategies.map(strategy => (
              <div
                key={strategy.name}
                className={`bg-surface-container-lowest rounded-xl border p-lg shadow-sm hover:shadow-md transition-shadow ${
                  strategy.recommended ? 'border-secondary ring-1 ring-secondary' : 'border-outline-variant'
                }`}
              >
                {strategy.recommended && (
                  <div className="flex items-center gap-1 mb-md">
                    <span className="px-2 py-0.5 bg-secondary text-on-primary rounded font-label-md text-label-md text-[10px] uppercase">Recommended</span>
                  </div>
                )}
                <h3 className="font-headline-md text-headline-md text-primary mb-sm">{strategy.name}</h3>
                <div className="flex gap-md mb-md">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Risk</p>
                    <p className={`font-data-tabular text-data-tabular font-bold ${
                      strategy.risk === 'Low' ? 'text-secondary' : strategy.risk === 'High' ? 'text-error' : 'text-tertiary-fixed-dim'
                    }`}>{strategy.risk}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Target Return</p>
                    <p className="font-data-tabular text-data-tabular font-bold text-secondary">{strategy.return}</p>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">{strategy.description}</p>
                <button className={`w-full py-sm px-md rounded-lg font-label-md text-label-md font-bold transition-colors ${
                  strategy.recommended
                    ? 'bg-secondary text-on-primary hover:opacity-90'
                    : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'
                }`}>
                  {strategy.recommended ? 'Apply Strategy' : 'View Details'}
                </button>
              </div>
            ))}
          </div>

          {/* Custom Parameters */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-lg">Custom Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Risk Tolerance</label>
                <input type="range" min="1" max="10" defaultValue="6"
                  className="w-full accent-secondary" />
                <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mt-1">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Investment Horizon</label>
                <select className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:border-secondary font-body-md text-primary outline-none">
                  <option>Short Term (&lt; 3 years)</option>
                  <option>Medium Term (3-7 years)</option>
                  <option>Long Term (7+ years)</option>
                </select>
              </div>
            </div>
            <button className="mt-lg px-lg py-sm bg-secondary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity">
              Generate Custom Strategy
            </button>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-lg">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                <span className="font-body-md text-body-md text-on-surface-variant">YTD Return</span>
                <span className="font-data-tabular text-data-tabular font-bold text-secondary">+9.8%</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                <span className="font-body-md text-body-md text-on-surface-variant">1 Year Return</span>
                <span className="font-data-tabular text-data-tabular font-bold text-secondary">+14.2%</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                <span className="font-body-md text-body-md text-on-surface-variant">3 Year Return (Annualized)</span>
                <span className="font-data-tabular text-data-tabular font-bold text-secondary">+11.5%</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                <span className="font-body-md text-body-md text-on-surface-variant">Best Month</span>
                <span className="font-data-tabular text-data-tabular font-bold text-secondary">+4.2%</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                <span className="font-body-md text-body-md text-on-surface-variant">Worst Month</span>
                <span className="font-data-tabular text-data-tabular font-bold text-error">-3.8%</span>
              </div>
              <div className="flex justify-between items-center py-sm">
                <span className="font-body-md text-body-md text-on-surface-variant">Max Drawdown</span>
                <span className="font-data-tabular text-data-tabular font-bold text-error">-12.4%</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-lg">Benchmark Comparison</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                <span className="font-body-md text-body-md text-on-surface-variant">Portfolio</span>
                <span className="font-data-tabular text-data-tabular font-bold text-secondary">+14.2%</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                <span className="font-body-md text-body-md text-on-surface-variant">S&P 500</span>
                <span className="font-data-tabular text-data-tabular font-bold">+18.5%</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                <span className="font-body-md text-body-md text-on-surface-variant">Aggressive Benchmark</span>
                <span className="font-data-tabular text-data-tabular font-bold">+16.1%</span>
              </div>
              <div className="flex justify-between items-center py-sm">
                <span className="font-body-md text-body-md text-on-surface-variant">Alpha (Excess Return)</span>
                <span className="font-data-tabular text-data-tabular font-bold text-error">-2.3%</span>
              </div>
              <div className="mt-lg p-md bg-surface-container-low rounded-lg">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <strong className="text-primary">Note:</strong> Your portfolio's lower volatility and higher Sharpe ratio (1.52 vs 1.18) indicate better risk-adjusted returns despite lower absolute performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPage;
