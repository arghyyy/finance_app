import React, { useState } from 'react';

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isUp: boolean;
}

interface AssetItem {
  symbol: string;
  name: string;
  price: string;
  changePercent: string;
  isUp: boolean;
  sector?: string;
  sparkline: number[];
}

const MarketsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto' | 'bonds' | 'forex'>('stocks');
  const [chartPeriod, setChartPeriod] = useState<'1H' | '1D' | '1W' | '1M' | '1Y'>('1D');

  const indices: MarketIndex[] = [
    { name: 'S&P 500', value: 5123.45, change: 45.21, changePercent: 0.89, isUp: true },
    { name: 'NASDAQ', value: 16234.80, change: 128.50, changePercent: 0.80, isUp: true },
    { name: 'DOW JONES', value: 38765.20, change: -32.10, changePercent: -0.08, isUp: false },
    { name: 'RUSSELL 2000', value: 2045.60, change: 12.30, changePercent: 0.60, isUp: true },
  ];

  const gainers: AssetItem[] = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: '$875.28', changePercent: '+4.20%', isUp: true, sector: 'Technology', sparkline: [40, 35, 45, 38, 50, 45, 55] },
    { symbol: 'AMD', name: 'Adv Micro Dev', price: '$162.45', changePercent: '+3.80%', isUp: true, sector: 'Technology', sparkline: [30, 35, 28, 40, 35, 42, 48] },
    { symbol: 'ARM', name: 'ARM Holdings', price: '$128.90', changePercent: '+2.50%', isUp: true, sector: 'Technology', sparkline: [45, 50, 42, 55, 48, 52, 58] },
    { symbol: 'META', name: 'Meta Platforms', price: '$515.30', changePercent: '+2.10%', isUp: true, sector: 'Technology', sparkline: [50, 48, 55, 52, 60, 58, 62] },
    { symbol: 'AVGO', name: 'Broadcom Inc.', price: '$1,345.80', changePercent: '+1.85%', isUp: true, sector: 'Technology', sparkline: [25, 30, 28, 35, 38, 35, 42] },
  ];

  const losers: AssetItem[] = [
    { symbol: 'INTC', name: 'Intel Corp', price: '$42.15', changePercent: '-2.80%', isUp: false, sector: 'Technology', sparkline: [55, 50, 52, 45, 48, 42, 40] },
    { symbol: 'PFE', name: 'Pfizer Inc.', price: '$28.50', changePercent: '-1.95%', isUp: false, sector: 'Healthcare', sparkline: [45, 42, 44, 38, 42, 36, 34] },
    { symbol: 'DIS', name: 'Walt Disney', price: '$112.30', changePercent: '-1.50%', isUp: false, sector: 'Entertainment', sparkline: [60, 55, 58, 50, 52, 48, 46] },
    { symbol: 'BA', name: 'Boeing Co.', price: '$185.60', changePercent: '-1.20%', isUp: false, sector: 'Aerospace', sparkline: [50, 48, 52, 46, 44, 48, 42] },
    { symbol: 'KO', name: 'Coca-Cola Co.', price: '$62.80', changePercent: '-0.85%', isUp: false, sector: 'Consumer', sparkline: [40, 42, 38, 40, 36, 38, 34] },
  ];

  const [marketMoversTab, setMarketMoversTab] = useState<'gainers' | 'losers'>('gainers');

  const equities: AssetItem[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$173.50', changePercent: '+0.45%', isUp: true, sparkline: [30, 28, 32, 25, 28, 30, 35] },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '$198.22', changePercent: '-1.20%', isUp: false, sparkline: [40, 42, 38, 44, 35, 38, 36] },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$175.80', changePercent: '+0.68%', isUp: true, sparkline: [25, 28, 22, 30, 26, 30, 32] },
  ];

  const crypto: AssetItem[] = [
    { symbol: 'BTC/USD', name: 'Bitcoin', price: '$68,450', changePercent: '+2.15%', isUp: true, sparkline: [50, 45, 55, 48, 60, 52, 65] },
    { symbol: 'ETH/USD', name: 'Ethereum', price: '$3,850.40', changePercent: '+1.80%', isUp: true, sparkline: [35, 40, 32, 45, 38, 42, 48] },
    { symbol: 'SOL/USD', name: 'Solana', price: '$148.20', changePercent: '+5.40%', isUp: true, sparkline: [20, 30, 25, 40, 35, 50, 55] },
  ];

  const forex: AssetItem[] = [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: '1.0845', changePercent: '-0.12%', isUp: false, sparkline: [30, 32, 35, 38, 40, 42, 45] },
    { symbol: 'USD/JPY', name: 'US Dollar / Yen', price: '150.25', changePercent: '+0.34%', isUp: true, sparkline: [45, 42, 40, 38, 35, 32, 30] },
    { symbol: 'GBP/USD', name: 'Pound / US Dollar', price: '1.2710', changePercent: '-0.08%', isUp: false, sparkline: [25, 28, 30, 28, 32, 30, 28] },
  ];

  const commodities: AssetItem[] = [
    { symbol: 'XAU/USD', name: 'Gold', price: '$2,150.80', changePercent: '+0.85%', isUp: true, sparkline: [50, 45, 48, 42, 38, 35, 30] },
    { symbol: 'XTI/USD', name: 'Crude Oil (WTI)', price: '$82.30', changePercent: '-0.55%', isUp: false, sparkline: [20, 22, 25, 28, 30, 35, 38] },
  ];

  const renderSparkline = (data: number[], isUp: boolean) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 40;
    const height = 16;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg className="mt-1" height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
        <polyline
          fill="none"
          stroke={isUp ? '#006c49' : '#ba1a1a'}
          strokeWidth="1.5"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary mb-xs">Global Markets</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time overview of major indices and asset classes.</p>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            1D
          </button>
          <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      {/* Bento Grid - Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Main Chart - S&P 500 */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col min-h-[400px]">
          <div className="flex justify-between items-start mb-xl">
            <div>
              <div className="flex items-center gap-sm mb-xs">
                <h3 className="font-headline-md text-headline-md text-primary">S&P 500 Index</h3>
                <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded font-label-md text-label-md">LIVE</span>
              </div>
              <div className="flex items-baseline gap-md">
                <span className="font-display-lg text-headline-lg font-bold text-primary">5,123.45</span>
                <span className="font-data-tabular text-data-tabular text-secondary flex items-center">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +45.21 (0.89%)
                </span>
              </div>
            </div>
            <div className="flex bg-surface-container-low rounded-lg p-xs">
              {(['1H', '1D', '1W', '1M', '1Y'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors ${
                    chartPeriod === p
                      ? 'bg-surface-container-lowest shadow-sm text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-surface-variant"
               style={{
                 backgroundImage: 'linear-gradient(to right, rgba(118, 119, 125, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(118, 119, 125, 0.05) 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
               }}>
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#006c49" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#006c49" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,250 L50,230 L100,240 L150,210 L200,220 L250,180 L300,190 L350,150 L400,170 L450,120 L500,140 L550,100 L600,110 L650,80 L700,100 L750,60 L800,70 L850,40 L900,50 L950,20 L1000,30 L1000,300 L0,300 Z" fill="url(#chartGradient)" />
              <path d="M0,250 L50,230 L100,240 L150,210 L200,220 L250,180 L300,190 L350,150 L400,170 L450,120 L500,140 L550,100 L600,110 L650,80 L700,100 L750,60 L800,70 L850,40 L900,50 L950,20 L1000,30" fill="none" stroke="#006c49" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>

        {/* Market Movers (Gainers & Losers) */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
          <div className="p-lg border-b border-outline-variant bg-surface-bright">
            <h3 className="font-headline-md text-[18px] font-semibold text-primary">Market Movers</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Top changes in 24h</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 text-center border-b border-outline-variant">
              <button
                onClick={() => setMarketMoversTab('gainers')}
                className={`py-sm font-label-md text-label-md transition-colors ${
                  marketMoversTab === 'gainers'
                    ? 'border-b-2 border-secondary text-secondary bg-surface-container-low/50'
                    : 'border-b-2 border-transparent text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setMarketMoversTab('losers')}
                className={`py-sm font-label-md text-label-md transition-colors ${
                  marketMoversTab === 'losers'
                    ? 'border-b-2 border-secondary text-secondary bg-surface-container-low/50'
                    : 'border-b-2 border-transparent text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Top Losers
              </button>
            </div>
            <div className="p-sm">
              {(marketMoversTab === 'gainers' ? gainers : losers).map(item => (
                <div key={item.symbol} className="flex items-center justify-between p-sm hover:bg-surface-container-lowest transition-colors rounded-lg group cursor-pointer">
                  <div className="flex items-center gap-md">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md font-bold text-[10px]">
                      {item.symbol}
                    </div>
                    <div>
                      <div className="font-data-tabular text-[14px] font-semibold text-primary">{item.name}</div>
                      <div className="font-label-md text-[11px] text-on-surface-variant">{item.sector}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-data-tabular text-[14px] text-primary">{item.price}</div>
                    <div className={`font-data-tabular text-[12px] ${item.isUp ? 'text-secondary' : 'text-error'}`}>
                      {item.changePercent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-sm border-t border-outline-variant bg-surface-bright">
            <button className="w-full py-xs text-center font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors">
              View All Movers
            </button>
          </div>
        </div>
      </div>

      {/* Indices Bar */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-outline-variant">
          {indices.map(idx => (
            <div key={idx.name} className="p-lg">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs">{idx.name}</p>
              <p className="font-data-tabular text-data-tabular font-bold text-primary">{idx.value.toLocaleString()}</p>
              <p className={`font-data-tabular text-data-tabular flex items-center gap-xs mt-xs ${idx.isUp ? 'text-secondary' : 'text-error'}`}>
                <span className="material-symbols-outlined text-[14px]">{idx.isUp ? 'trending_up' : 'trending_down'}</span>
                {idx.isUp ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent.toFixed(2)}%)
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Watchlist */}
      <div className="space-y-lg">
        <div className="flex items-center justify-between border-b border-outline-variant pb-sm">
          <h3 className="font-headline-md text-[20px] font-semibold text-primary flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary-fixed-dim">view_list</span>
            Asset Watchlist
          </h3>
          <button className="font-label-md text-label-md text-primary hover:underline">Manage Lists</button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-md border-b border-outline-variant">
          {(['stocks', 'crypto', 'bonds', 'forex'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-sm px-md font-label-md text-label-md uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-secondary border-b-2 border-secondary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'stocks' ? 'Equities' : tab === 'crypto' ? 'Crypto' : tab === 'bonds' ? 'Bonds' : 'Forex'}
            </button>
          ))}
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {/* Equities */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-md">
              <h4 className="font-body-lg text-[16px] font-semibold text-primary">Equities</h4>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">show_chart</span>
            </div>
            <div className="space-y-sm">
              {equities.map(item => (
                <div key={item.symbol} className="flex justify-between items-end border-b border-surface-container pb-sm last:border-0">
                  <div>
                    <div className="font-label-md text-[11px] text-on-surface-variant">{item.symbol}</div>
                    <div className="font-data-tabular text-[15px] text-primary">{item.price}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-data-tabular text-[12px] ${item.isUp ? 'text-secondary' : 'text-error'}`}>
                      {item.changePercent}
                    </div>
                    {renderSparkline(item.sparkline, item.isUp)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crypto */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-md">
              <h4 className="font-body-lg text-[16px] font-semibold text-primary">Cryptocurrency</h4>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">currency_bitcoin</span>
            </div>
            <div className="space-y-sm">
              {crypto.map(item => (
                <div key={item.symbol} className="flex justify-between items-end border-b border-surface-container pb-sm last:border-0">
                  <div>
                    <div className="font-label-md text-[11px] text-on-surface-variant">{item.symbol}</div>
                    <div className="font-data-tabular text-[15px] text-primary">{item.price}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-data-tabular text-[12px] ${item.isUp ? 'text-secondary' : 'text-error'}`}>
                      {item.changePercent}
                    </div>
                    {renderSparkline(item.sparkline, item.isUp)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forex */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-md">
              <h4 className="font-body-lg text-[16px] font-semibold text-primary">Forex</h4>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">currency_exchange</span>
            </div>
            <div className="space-y-sm">
              {forex.map(item => (
                <div key={item.symbol} className="flex justify-between items-end border-b border-surface-container pb-sm last:border-0">
                  <div>
                    <div className="font-label-md text-[11px] text-on-surface-variant">{item.symbol}</div>
                    <div className="font-data-tabular text-[15px] text-primary">{item.price}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-data-tabular text-[12px] ${item.isUp ? 'text-secondary' : 'text-error'}`}>
                      {item.changePercent}
                    </div>
                    {renderSparkline(item.sparkline, item.isUp)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commodities */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-md">
              <h4 className="font-body-lg text-[16px] font-semibold text-primary">Commodities</h4>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">oil_barrel</span>
            </div>
            <div className="space-y-sm">
              {commodities.map(item => (
                <div key={item.symbol} className="flex justify-between items-end border-b border-surface-container pb-sm last:border-0">
                  <div>
                    <div className="font-label-md text-[11px] text-on-surface-variant">{item.symbol}</div>
                    <div className="font-data-tabular text-[15px] text-primary">{item.price}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-data-tabular text-[12px] ${item.isUp ? 'text-secondary' : 'text-error'}`}>
                      {item.changePercent}
                    </div>
                    {renderSparkline(item.sparkline, item.isUp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
