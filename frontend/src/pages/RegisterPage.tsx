import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ─── SVG Icon Components ────────────────────────────────────────────────
const IconAccountBalance = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-5-6L2 6v2h17V6l-8-2z" />
  </svg>
);

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

// ─── Page ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ ...form, age: 0 });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const pwd = form.password;
    if (!pwd) return { bars: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score >= 3) return { bars: 3, label: 'Strong', color: 'bg-[#22c55e]' };
    if (score >= 2) return { bars: 2, label: 'Medium', color: 'bg-[#f59e0b]' };
    return { bars: 1, label: 'Weak', color: 'bg-[#ef4444]' };
  };

  const strength = passwordStrength();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation – hidden on mobile */}
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
          <li>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#10B981] font-bold border-r-[3px] border-[#10B981] bg-[#F0FDF4]/50 transition-colors">
              <IconCheckCircle className="w-[22px] h-[22px] text-[#10B981]" />
              <span className="text-[16px] font-medium">Account Creation</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
              <IconRadioUnchecked className="w-[22px] h-[22px]" />
              <span className="text-[16px] font-medium">Personal Details</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
              <IconRadioUnchecked className="w-[22px] h-[22px]" />
              <span className="text-[16px] font-medium">Financial Context</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
              <IconRadioUnchecked className="w-[22px] h-[22px]" />
              <span className="text-[16px] font-medium">Final Action</span>
            </a>
          </li>
        </ul>
        <div className="mt-auto">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-[12px] font-semibold uppercase tracking-wider">
            <IconHelpOutline className="w-[18px] h-[18px]" />
            Get Help
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 min-h-screen">
        <div className="w-full max-w-[480px] bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] border border-[#E2E8F0] p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-sm">
              $
            </div>
            <h2 className="text-[24px] font-semibold text-[#0F172A] tracking-tight">Create Account</h2>
            <p className="text-[14px] text-[#64748B] mt-1">Smart Advisor, Smarter Future.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* form input */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#64748B]" htmlFor="reg-name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  id="reg-name"
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] text-[14px] text-[#0F172A] placeholder-[#94A3B8]/60 transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#64748B]" htmlFor="reg-email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] text-[14px] text-[#0F172A] placeholder-[#94A3B8]/60 transition-all outline-none"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#64748B]" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] text-[14px] text-[#0F172A] placeholder-[#94A3B8]/60 transition-all outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors">
                  {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {form.password && (
                <div className="pt-1 flex gap-1 items-center">
                  <div className={`h-1 flex-1 rounded-full transition-all ${strength.bars >= 1 ? strength.color : 'bg-[#E2E8F0]'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all ${strength.bars >= 2 ? strength.color : 'bg-[#E2E8F0]'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all ${strength.bars >= 3 ? strength.color : 'bg-[#E2E8F0]'}`} />
                  <span className={`text-[12px] ml-2 font-medium ${strength.bars >= 2 ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#10B981] focus:ring-[#10B981] transition-colors cursor-pointer"
              />
              <label htmlFor="terms" className="text-[14px] text-[#64748B] cursor-pointer leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-[#0F172A] font-medium hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-[#0F172A] font-medium hover:underline">Privacy Policy</a>.
              </label>
            </div>

            {/* submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] text-white py-2.5 px-4 rounded-lg font-semibold text-[12px] uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Continue'
              )}
            </button>
          </form>

          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-[#E2E8F0]" />
            <span className="flex-shrink-0 mx-3 text-[14px] text-[#94A3B8] bg-white px-2">Or sign up with</span>
            <div className="flex-grow border-t border-[#E2E8F0]" />
          </div>

          {/* google button */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E2E8F0] rounded-lg bg-white hover:bg-[#F8FAFC] transition-colors text-[#0F172A] text-sm font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            {/* apple button */}
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E2E8F0] rounded-lg bg-white hover:bg-[#F8FAFC] transition-colors text-[#0F172A] text-sm font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.49.09 2.59.57 3.35 1.5-3.04 1.77-2.52 5.76.54 6.88-.71 1.83-1.63 3.46-2.47 4.59zm-3.32-15.01c-.13-2.14 1.78-4.08 3.98-4.27.27 2.32-1.92 4.29-3.98 4.27z" />
              </svg>
              Apple
            </button>
          </div>

          {/* jika sudah punya akun */}
          <p className="text-center text-[14px] text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0F172A] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
