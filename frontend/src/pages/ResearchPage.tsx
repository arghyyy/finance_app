import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Inline SVG Icons ───────────────────────────────────────────────────
const Icon = ({ name, className = '', fill = false }: { name: string; className?: string; fill?: boolean }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: fill ? "'FILL' 1" : undefined }}
  >
    {name}
  </span>
);

interface ReportArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tag: string;
}

const ResearchPage: React.FC = () => {
  const [baseAsset, setBaseAsset] = useState('AAPL');
  const [compareAsset, setCompareAsset] = useState('MSFT');
  const navigate = useNavigate();

  const reports: ReportArticle[] = [
    {
      id: '1',
      title: 'Q3 Tech Sector Outlook: AI Integration & Capital Expenditure',
      description: 'An in-depth analysis of how major technology firms are allocating capital towards AI infrastructure and the expected impact on long-term margins.',
      category: 'Nexus Analytics',
      author: 'Nexus Analytics Team',
      date: 'Oct 24, 2023',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop', // Tech stock market abstract
      tag: 'Q3 24',
    },
    {
      id: '2',
      title: 'Navigating Interest Rate Divergence in G7 Economies',
      description: 'Strategic positioning recommendations amid shifting monetary policies between the Federal Reserve and the European Central Bank.',
      category: 'Global Macro Team',
      author: 'Global Macro Team',
      date: 'Oct 20, 2023',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop', // Global macro map/money
      tag: 'Strategy',
    },
  ];

  return (
    <div className="max-w-container-max mx-auto space-y-8">
      {/* Top Header matching mockup */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-[#e2e8f0] pb-6">
        <h2 className="text-[24px] font-bold text-[#000000] tracking-tight">Financial Research Hub</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px]" />
            <input 
              type="text" 
              placeholder="Search reports, assets, or concepts..." 
              className="w-full bg-[#f2f4f6] rounded-md py-2 pl-10 pr-4 text-[14px] text-[#000000] focus:outline-none focus:ring-1 focus:ring-[#c6c6cd]"
            />
          </div>
          <button className="w-10 h-10 hover:bg-[#f2f4f6] rounded-full flex items-center justify-center transition-colors text-[#45464d]">
            <Icon name="notifications" className="text-[20px]" />
          </button>
          <button className="w-10 h-10 hover:bg-[#f2f4f6] rounded-full flex items-center justify-center transition-colors text-[#45464d]">
            <Icon name="help" className="text-[20px]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-[#e2e8f0]">
             {/* Fake Avatar */}
             <div className="w-full h-full bg-[#2a3040]"></div>
          </div>
        </div>
      </div>

      {/* Main Page Title */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-[40px] md:text-[48px] font-bold text-[#000000] tracking-tight leading-tight">Research & Analysis Hub</h1>
        <p className="text-[16px] text-[#45464d]">Curated insights, advanced comparative tools, and strategic educational resources.</p>
      </div>

      {/* Asset Comparison Engine */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[24px] font-bold text-[#000000] flex items-center gap-3">
            <Icon name="compare_arrows" className="text-[#006c49] text-[28px]" />
            Asset Comparison Engine
          </h2>
          <button className="text-[#006c49] text-[14px] font-semibold hover:underline flex items-center gap-1">
            Advanced Mode <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 relative">
          {/* Base Asset */}
          <div className="flex-1 w-full bg-[#f8f9fa] border border-[#e2e8f0] rounded-xl p-4 flex flex-col focus-within:border-[#c6c6cd] transition-colors relative md:pr-12">
            <label className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-2">Base Asset</label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center shrink-0 shadow-sm text-white overflow-hidden">
                  <Icon name="apple" className="text-[18px]" />
                </div>
                <input
                  className="bg-transparent border-none text-[24px] font-bold text-[#000000] p-0 focus:ring-0 uppercase outline-none w-24"
                  value={baseAsset}
                  onChange={e => setBaseAsset(e.target.value)}
                />
              </div>
              <Icon name="arrow_drop_down" className="text-[#76777d] cursor-pointer hover:text-[#000000]" />
            </div>
          </div>

          {/* VS Badge (Absolute centered on desktop) */}
          <div className="md:absolute left-1/2 top-1/2 md:-translate-x-[calc(50%+60px)] md:-translate-y-1/2 flex-shrink-0 w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center font-bold text-[12px] text-[#45464d] shadow-sm z-10 my-2 md:my-0">
            VS
          </div>

          {/* Compare Asset */}
          <div className="flex-1 w-full bg-[#f8f9fa] border border-[#e2e8f0] rounded-xl p-4 flex flex-col focus-within:border-[#c6c6cd] transition-colors relative md:pl-12">
            <label className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-2">Comparison Asset</label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center shrink-0 shadow-sm text-white overflow-hidden">
                  <Icon name="window" className="text-[18px]" />
                </div>
                <input
                  className="bg-transparent border-none text-[24px] font-bold text-[#000000] p-0 focus:ring-0 uppercase outline-none w-24"
                  value={compareAsset}
                  onChange={e => setCompareAsset(e.target.value)}
                />
              </div>
              <Icon name="arrow_drop_down" className="text-[#76777d] cursor-pointer hover:text-[#000000]" />
            </div>
          </div>

          {/* Analyze Button */}
          <button className="w-full md:w-auto h-[84px] px-10 bg-[#006c49] text-white rounded-xl font-bold text-[20px] hover:opacity-90 transition-opacity shadow-md flex items-center justify-center ml-auto">
            Analyze
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#f8f9fa] rounded-lg border border-[#e2e8f0] p-4 flex justify-between items-center">
            <span className="text-[12px] font-bold text-[#76777d] uppercase tracking-wider">P/E Ratio</span>
            <div className="flex gap-3 text-[16px] font-semibold">
              <span className="text-[#45464d]">28.4</span>
              <span className="text-[#c6c6cd]">|</span>
              <span className="text-[#45464d]">36.2</span>
            </div>
          </div>
          <div className="bg-[#f8f9fa] rounded-lg border border-[#e2e8f0] p-4 flex justify-between items-center">
            <span className="text-[12px] font-bold text-[#76777d] uppercase tracking-wider">Volatility (30d)</span>
            <div className="flex gap-3 text-[16px] font-semibold">
              <span className="text-[#006c49]">Low</span>
              <span className="text-[#c6c6cd]">|</span>
              <span className="text-[#76777d]">Med</span>
            </div>
          </div>
          <div className="bg-[#f8f9fa] rounded-lg border border-[#e2e8f0] p-4 flex justify-between items-center">
            <span className="text-[12px] font-bold text-[#76777d] uppercase tracking-wider">YTD Return</span>
            <div className="flex gap-3 text-[16px] font-semibold">
              <span className="text-[#006c49]">+12.4%</span>
              <span className="text-[#c6c6cd]">|</span>
              <span className="text-[#006c49]">+18.1%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Reports */}
      <section className="flex flex-col gap-6 mt-12 pb-12">
        <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-4">
          <h2 className="text-[24px] font-bold text-[#000000] flex items-center gap-3">
            <Icon name="article" className="text-[#45464d] text-[24px]" />
            Institutional Reports
          </h2>
          <button className="text-[#006c49] text-[14px] font-semibold hover:underline">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reports.map(report => (
            <article
              key={report.id}
              onClick={() => navigate(`/research/${report.id}`)}
              className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer"
            >
              {/* Image Placeholder */}
              <div className="h-56 w-full relative overflow-hidden bg-[#131b2e]">
                <img src={report.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded text-[12px] font-bold text-[#000000] shadow-sm">
                  {report.tag}
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <span className="text-[12px] font-bold text-[#006c49] uppercase tracking-wider mb-2">{report.category}</span>
                <h3 className="text-[24px] font-bold text-[#000000] leading-snug mb-4 line-clamp-2">{report.title}</h3>
                <p className="text-[16px] text-[#45464d] line-clamp-3 flex-1 mb-8 leading-relaxed">{report.description}</p>
                <button className="w-full bg-transparent border border-[#e2e8f0] text-[#000000] py-3 rounded-lg font-semibold text-[14px] hover:bg-[#f8f9fa] transition-colors flex justify-center items-center gap-2">
                  Read Report <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResearchPage;
