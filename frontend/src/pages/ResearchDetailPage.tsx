import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Icon = ({ name, className = '', fill = false }: { name: string; className?: string; fill?: boolean }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: fill ? "'FILL' 1" : undefined }}
  >
    {name}
  </span>
);

export default function ResearchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const reports = [
    {
      id: '1',
      title: 'Q3 Tech Sector Outlook: AI Integration & Capital Expenditure',
      description: 'An in-depth analysis of how major technology firms are allocating capital towards AI infrastructure and the expected impact on long-term margins.',
      category: 'Nexus Analytics',
      author: 'Nexus Analytics Team',
      date: 'Oct 24, 2023',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
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
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop',
      tag: 'Strategy',
    },
  ];

  const report = reports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="max-w-container-max mx-auto text-center py-20">
        <h1 className="text-[24px] font-bold text-[#000000]">Article Not Found</h1>
        <button onClick={() => navigate('/research')} className="mt-4 text-[#006c49] hover:underline font-semibold">
          &larr; Back to Research
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button 
        onClick={() => navigate('/research')} 
        className="flex items-center gap-2 text-[#45464d] hover:text-[#000000] font-semibold transition-colors w-fit"
      >
        <Icon name="arrow_back" /> Back to Research
      </button>

      {/* Hero Image */}
      <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden bg-[#131b2e] relative shadow-md">
        <img src={report.image} alt={report.title} className="w-full h-full object-cover opacity-80" />
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8 md:p-12 mt-[-60px] relative z-10 mx-4 md:mx-12">
        <div className="flex items-center gap-4 text-[#76777d] text-[12px] font-bold uppercase tracking-wider mb-6 flex-wrap">
          <span className="bg-[#6cf8bb]/20 text-[#006c49] px-3 py-1 rounded">{report.category}</span>
          <span>•</span>
          <span>{report.date}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Icon name="schedule" className="text-[14px]" /> {report.readTime}
          </span>
        </div>

        <h1 className="text-[32px] md:text-[48px] font-bold text-[#000000] mb-8 leading-tight tracking-tight">{report.title}</h1>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-y border-[#e2e8f0] py-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f2f4f6] border border-[#c6c6cd] flex items-center justify-center shadow-sm">
              <Icon name="account_balance" className="text-[#000000]" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#000000]">{report.author}</p>
              <p className="text-[12px] text-[#45464d]">Institutional Research</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#000000] font-semibold text-[14px] hover:bg-[#f2f4f6] transition-colors">
              <Icon name="share" className="text-[18px]" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#006c49] text-[#006c49] font-semibold text-[14px] hover:bg-[#006c49]/10 transition-colors">
              <Icon name="bookmark_add" className="text-[18px]" />
              Save
            </button>
          </div>
        </div>

        <div className="max-w-3xl space-y-6">
          <p className="text-[18px] text-[#45464d] font-medium leading-relaxed">
            {report.description} This represents a structural shift in how capital is deployed across the sector, moving from speculative R&D towards foundational infrastructure that will power the next decade of enterprise solutions.
          </p>

          <h2 className="text-[24px] font-bold text-[#000000] mt-10">The CapEx Supercycle</h2>
          <p className="text-[16px] text-[#45464d] leading-relaxed">
            We are observing what we classify as a "CapEx Supercycle." Major cloud service providers (CSPs) have collectively revised their capital expenditure guidance upwards by 22% year-over-year. This spending is overwhelmingly directed towards high-performance computing (HPC) clusters, advanced networking hardware, and custom silicon development designed specifically to handle large language model (LLM) training and inference workloads.
          </p>

          <div className="bg-[#f8f9fa] border-l-4 border-[#006c49] p-6 rounded-r-xl my-8">
            <p className="text-[18px] italic text-[#000000] font-medium leading-relaxed">
              "The integration phase of AI is ending; the deployment and monetization phase is accelerating faster than historical software adoption curves."
            </p>
            <p className="text-[12px] font-bold text-[#76777d] uppercase tracking-wider mt-4">
              — Sarah Jenkins, Lead Analyst
            </p>
          </div>

          <h3 className="text-[20px] font-bold text-[#000000] mt-10">Key Drivers of Sector Outperformance</h3>
          <ul className="list-disc pl-6 space-y-4 text-[16px] text-[#45464d] leading-relaxed marker:text-[#006c49]">
            <li><strong className="text-[#000000]">Accelerated Compute Dominance:</strong> Demand for GPUs and specialized AI accelerators continues to outstrip supply, creating a backlog that provides unprecedented revenue visibility for semiconductor designers and fabricators into late 2024.</li>
            <li><strong className="text-[#000000]">Software Monetization Inflexion:</strong> Enterprise software vendors are moving from beta to general availability for their AI-copilot tools, establishing new high-margin recurring revenue streams.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
