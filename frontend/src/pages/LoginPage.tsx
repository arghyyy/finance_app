import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-full max-w-lg mx-auto px-12 py-16 text-center">
      {/* Lock Icon */}
      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-black flex items-center justify-center">
        <Lock className="w-6 h-6 text-white" />
      </div>

      {/* Judul aplikasi */}
      <h1 className="text-[26px] font-bold text-black tracking-tight">Nexus Finance</h1>
      <p className="text-[14px] text-[#5f6368] mt-1 mb-8">Smart Advisor, Smarter Future.</p>

      {/* Form input email */}
      <form onSubmit={handleSubmit} className="text-left space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[#3c4043] mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full h-[46px] px-4 bg-white border border-[#dadce0] rounded-lg text-[14px] text-[#131b2e] placeholder:text-[#9aa0a6] outline-none transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black/20"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Form input password */}
        <div>
          <label className="block text-[13px] font-medium text-[#3c4043] mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-[46px] px-4 bg-white border border-[#dadce0] rounded-lg text-[14px] text-[#131b2e] placeholder:text-[#9aa0a6] outline-none transition-all duration-200 focus:border-black focus:ring-1 focus:ring-black/20 pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-black transition-colors"
            >
              {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* forgot password */}
        <div className="flex justify-end pt-0.5">
          <button type="button" className="text-[13px] text-[#5f6368] hover:text-black transition-colors">
            Lupa Kata Sandi?
          </button>
        </div>

        {/* alert kalo salah password atau email */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* button submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[46px] bg-[#00A572] text-[#FFFFFF] text-[15px] font-bold rounded-lg hover:bg-[#3ccb90] transition-all duration-200 disabled:opacity-60"
        >
          {loading ? 'Memproses…' : 'Sign In'}
        </button>
      </form>

      <p className="text-[13px] text-[#5f6368] mt-6">
        Belum punya akun?{' '}
        <Link to="/register" className="text-black font-semibold hover:underline">Sign Up</Link>
      </p>
    </div>
  );
}
