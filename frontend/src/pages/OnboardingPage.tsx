import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ─── SVG Icons ──────────────────────────────────────────────────────────
const IconCheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const IconRadioUnchecked = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
  </svg>
);

const IconHelpOutline = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
  </svg>
);

const IconArrowBack = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const IconArrowForward = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);

function formatRupiah(value: string): string {
  if (!value) return '';
  const num = parseInt(value);
  if (isNaN(num)) return value;
  return num.toLocaleString('id-ID');
}

// ─── Sidebar ────────────────────────────────────────────────────────────
const STEPS = [
  'Account Creation',
  'Personal Details',
  'Financial Context',
  'Final Action',
];

function Sidebar({ currentStep }: { currentStep: number }) {
  return (
    <nav className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E2E8F0] p-8">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
            $
          </div>
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Nexus</h1>
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B] mt-2">Onboarding Wizard</p>
      </div>
      <ul className="flex flex-col gap-2 flex-1">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          let textColor = 'text-[#64748B]';
          let bgColor = '';
          let borderRight = '';

          if (isCompleted || isActive) {
            textColor = 'text-[#10B981] font-bold';
            bgColor = 'bg-[#F0FDF4]/50';
            borderRight = 'border-r-[3px] border-[#10B981]';
          }

          return (
            <li key={stepNum}>
              <a className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${textColor} ${bgColor} ${borderRight} transition-colors`}>
                {isCompleted ? (
                  <IconCheckCircle className="w-[22px] h-[22px] text-[#10B981]" />
                ) : (
                  <IconRadioUnchecked className={`w-[22px] h-[22px] ${isActive ? 'text-[#10B981]' : 'text-[#64748B]'}`} />
                )}
                <span className="text-[16px] font-medium">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-[12px] font-semibold uppercase tracking-wider">
          <IconHelpOutline className="w-[18px] h-[18px]" />
          Get Help
        </button>
      </div>
    </nav>
  );
}

// ─── Step 2: Personal Details ───────────────────────────────────────────
function PersonalDetailsStep({ onNext }: { onNext: () => void }) {
  const [age, setAge] = useState('');
  const [status, setStatus] = useState('');

  const valid = age && parseInt(age) > 0 && status;

  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1 text-[#10B981] text-[12px] font-semibold uppercase tracking-wider">
          <IconCheckCircle className="w-4 h-4" />
          <span>Step 2 of 4</span>
        </div>
        <h2 className="text-[24px] md:text-[32px] font-semibold text-[#0F172A] tracking-tight">Let's start with the basics.</h2>
        <p className="text-[16px] text-[#64748B]">Tell us a little about yourself so we can personalize your financial experience.</p>
      </div>

      <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div className="h-full bg-[#10B981] w-1/2 rounded-full transition-all" />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#64748B]" htmlFor="age">Age</label>
            <input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)}
              placeholder="25" min={1} max={150} required
              className="w-full px-4 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] text-[14px] text-[#0F172A] placeholder-[#94A3B8]/60 transition-all outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#64748B]" htmlFor="status">Residential Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} required
              className="w-full px-4 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] text-[14px] text-[#0F172A] transition-all outline-none appearance-none">
              <option value="" disabled>Select status</option>
              <option value="homeowner">Homeowner</option>
              <option value="mortgage">Mortgage</option>
              <option value="rent">Rent</option>
              <option value="living_with_family">Living with Family</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-8 pt-6 border-t border-[#E2E8F0]">
          <button type="submit" disabled={!valid}
            className="px-6 py-2.5 rounded-lg bg-[#10B981] text-white text-[12px] font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0px_4px_10px_rgba(0,0,0,0.1)]">
            Continue <IconArrowForward className="w-[18px] h-[18px]" />
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center gap-2 text-[12px] text-[#94A3B8]">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" /></svg>
        <span>Your data is securely encrypted</span>
      </div>
    </div>
  );
}

// ─── Step 3: Financial Context ──────────────────────────────────────────
const RISK_OPTIONS = [
  { id: 'conservative', label: 'Conservative', desc: 'Lower risk, stable returns.', icon: '🛡️' },
  { id: 'balanced', label: 'Balanced', desc: 'Moderate risk with steady growth.', icon: '⚖️' },
  { id: 'aggressive', label: 'Aggressive', desc: 'Higher risk, maximize long-term growth.', icon: '🚀' },
];

function FinancialContextStep({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [dependents, setDependents] = useState(0);
  const [riskProfile, setRiskProfile] = useState('balanced');

  return (
    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1 text-[#10B981] text-[12px] font-semibold uppercase tracking-wider">
          <IconCheckCircle className="w-4 h-4" />
          <span>Step 3 of 4</span>
        </div>
        <h2 className="text-[24px] md:text-[32px] font-semibold text-[#0F172A] tracking-tight">Financial Context</h2>
        <p className="text-[16px] text-[#64748B]">Help us understand your financial responsibilities and risk tolerance.</p>
      </div>

      <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div className="h-full bg-[#10B981] w-3/4 rounded-full transition-all" />
      </div>

      {/* Dependents */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] p-6 md:p-8">
        <h3 className="text-[20px] font-semibold text-[#0F172A]">Dependents</h3>
        <p className="text-[14px] text-[#64748B] mt-1 mb-6">How many people depend on your income?</p>
        <div className="flex items-center justify-center gap-6 py-4">
          <button type="button" onClick={() => setDependents(Math.max(0, dependents - 1))}
            className="w-12 h-12 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#0F172A] hover:bg-[#F1F5F9] transition-all text-[24px] font-semibold">−</button>
          <div className="w-20 text-center">
            <span className="text-[48px] font-bold text-[#0F172A] leading-none">{dependents}</span>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B] mt-2">{dependents === 0 ? 'None' : dependents === 1 ? 'Person' : 'People'}</p>
          </div>
          <button type="button" onClick={() => setDependents(Math.min(20, dependents + 1))}
            className="w-12 h-12 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center text-[#0F172A] hover:bg-[#F1F5F9] transition-all text-[24px] font-semibold">+</button>
        </div>
      </div>


      <div className="flex justify-between pt-6 border-t border-[#E2E8F0]">
        <button type="button" onClick={onBack}
          className="px-6 py-2.5 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-[12px] font-semibold uppercase tracking-wider hover:bg-[#F1F5F9] transition-colors flex items-center gap-2">
          <IconArrowBack className="w-[18px] h-[18px]" /> Back
        </button>
        <button type="button" onClick={onNext}
          className="px-6 py-2.5 rounded-lg bg-[#10B981] text-white text-[12px] font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0px_4px_10px_rgba(0,0,0,0.1)]">
          Continue <IconArrowForward className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Final Action ───────────────────────────────────────────────
const GOALS = [
  { id: 'retirement', label: 'Retirement Planning', desc: 'Long-term wealth accumulation' },
  { id: 'emergency', label: 'Emergency Fund', desc: 'Liquid assets for unexpected events' },
  { id: 'property', label: 'Property Purchase', desc: 'Saving for a down payment' },
  { id: 'marriage', label: 'Marriage / Wedding', desc: 'Save for wedding and married life' },
  { id: 'car', label: 'Car Purchase', desc: 'Save for a new or used vehicle' },
  { id: 'travelling', label: 'Travelling', desc: 'Saving for travelling' }
];

function FinalActionStep({ onFinish, onBack }: { onFinish: () => void, onBack: () => void }) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['retirement', 'emergency']);
  const [goals, setGoals] = useState<{ name: string; amount: string; years: string; months: string }[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const toggleCustomGoal = (id: string) => {
    if (goals.find((g) => g.name === id)) {
      setGoals((prev) => prev.filter((g) => g.name !== id));
    } else {
      setGoals((prev) => [...prev, { name: id, amount: '', years: '5', months: '0' }]);
    }
  };

  const isCustomGoalSelected = (id: string) => goals.some((g) => g.name === id);

  return (
    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1 text-[#10B981] text-[12px] font-semibold uppercase tracking-wider">
          <IconCheckCircle className="w-4 h-4" />
          <span>Step 4 of 4</span>
        </div>
        <h2 className="text-[24px] md:text-[32px] font-semibold text-[#0F172A] tracking-tight">Finalize Your Profile</h2>
        <p className="text-[16px] text-[#64748B]">Set your primary financial goals and provide any necessary documentation.</p>
      </div>

      <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div className="h-full bg-[#10B981] w-full rounded-full transition-all" />
      </div>

      {/* Preset Goals */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] p-6 md:p-8">
        <h3 className="text-[20px] font-semibold text-[#0F172A]">Financial Goals</h3>
        <p className="text-[14px] text-[#64748B] mt-1 mb-4">Select the goals you want us to optimize for.</p>
        <div className="flex flex-col gap-3">
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <button key={goal.id} type="button" onClick={() => toggleGoal(goal.id)}
                className={`flex items-center justify-between p-4 rounded-lg transition-all text-left ${isSelected ? 'border-2 border-[#0F172A] bg-[#F8FAFC]' : 'border-2 border-[#E2E8F0] bg-white hover:border-[#94A3B8] opacity-70 hover:opacity-100'}`}>
                <div>
                  <h4 className="text-[16px] font-semibold text-[#0F172A]">{goal.label}</h4>
                  <p className="text-[14px] text-[#64748B]">{goal.desc}</p>
                </div>
                {isSelected ? <IconCheckCircle className="w-5 h-5 text-[#10B981]" /> : <IconRadioUnchecked className="w-5 h-5 text-[#94A3B8]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Goals with amounts */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[20px] font-semibold text-[#0F172A]">Goal Details</h3>
            <p className="text-[14px] text-[#64748B] mt-1">Set targets and timelines for your goals.</p>
          </div>
          <button type="button" onClick={() => setGoals([...goals, { name: '', amount: '', years: '5', months: '0' }])}
            className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-[12px] font-semibold uppercase tracking-wider hover:bg-[#F1F5F9] transition-colors">+ Add Goal</button>
        </div>

        {goals.length === 0 && (
          <p className="text-[14px] text-[#94A3B8] italic">Click "+ Add Goal" to set custom financial targets.</p>
        )}

        {goals.map((g, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">Name</label>
              <input placeholder="Goal name" value={g.name} onChange={(e) => {
                const newGoals = [...goals];
                newGoals[i].name = e.target.value;
                setGoals(newGoals);
              }} className="w-full px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[14px] outline-none focus:border-[#0F172A]" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">Target (Rp)</label>
              <input type="text" placeholder="0" value={formatRupiah(g.amount)} onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                const newGoals = [...goals];
                newGoals[i].amount = raw;
                setGoals(newGoals);
              }} className="w-full px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[14px] outline-none focus:border-[#0F172A]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">Years</label>
              <input type="number" placeholder="5" value={g.years} onChange={(e) => {
                const newGoals = [...goals];
                newGoals[i].years = e.target.value;
                setGoals(newGoals);
              }} className="w-full px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[14px] outline-none focus:border-[#0F172A]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">Months</label>
              <input type="number" placeholder="0" value={g.months} onChange={(e) => {
                const newGoals = [...goals];
                newGoals[i].months = e.target.value;
                setGoals(newGoals);
              }} className="w-full px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-[14px] outline-none focus:border-[#0F172A]" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="button" onClick={() => setGoals(goals.filter((_, j) => j !== i))}
                className="px-4 py-2 text-[#EF4444] text-[12px] font-semibold hover:bg-red-50 rounded-lg transition-colors">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload E-Statements */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] p-6 md:p-8">
        <h3 className="text-[20px] font-semibold text-[#0F172A]">E-Statements</h3>
        <p className="text-[14px] text-[#64748B] mt-1 mb-4">Upload recent statements to jumpstart your analysis.</p>
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E2E8F0] hover:border-[#10B981] rounded-lg bg-[#F8FAFC]/50 cursor-pointer transition-colors">
          <input type="file" accept=".pdf,.csv,.jpg" onChange={(e) => setUploadedFile(e.target.files?.[0] || null)} className="hidden" />
          <svg className="w-8 h-8 text-[#10B981] mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" /></svg>
          <p className="text-[16px] font-semibold text-[#0F172A] mb-1">Drag & drop files here</p>
          <p className="text-[14px] text-[#64748B]">or click to browse</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#76777D] mt-2">Supported: PDF, CSV, JPG (Max 10MB)</p>
        </label>
        {uploadedFile && (
          <div className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-lg mt-3 bg-[#F8FAFC]">
            <span className="text-[14px] text-[#0F172A] truncate">{uploadedFile.name}</span>
            <span className="text-[12px] font-semibold uppercase text-[#10B981]">100%</span>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t border-[#E2E8F0]">
        <button type="button" onClick={onBack} disabled={loading}
          className="px-6 py-2.5 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-[12px] font-semibold uppercase tracking-wider hover:bg-[#F1F5F9] transition-colors flex items-center gap-2">
          <IconArrowBack className="w-[18px] h-[18px]" /> Back
        </button>
        <button type="button" onClick={onFinish} disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-[#0F172A] text-white text-[12px] font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0px_4px_10px_rgba(0,0,0,0.1)]">
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Complete Setup <IconArrowForward className="w-[18px] h-[18px]" /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(2); // Step 1 done di RegisterPage

  // Kalau sudah selesai onboarding, redirect
  if (user?.onboarding_completed) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar currentStep={step} />
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {step === 2 && <PersonalDetailsStep onNext={() => setStep(3)} />}
        {step === 3 && <FinancialContextStep onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <FinalActionStep onFinish={handleFinish} onBack={() => setStep(3)} />}
      </main>
    </div>
  );
}