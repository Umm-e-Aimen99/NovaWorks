import React, { useState } from 'react';
import { api } from '../api/client';
import { User } from '../types';
import { Shield, Sparkles, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('infinity2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'ADMIN',
      name: 'Executive Admin',
      email: 'admin@infinityhack.io',
      desc: 'Full portfolio oversight & meeting processor',
      badge: 'bg-purple-950 text-purple-300 border border-purple-800'
    },
    {
      role: 'MANAGER',
      name: 'Ayesha Khan',
      email: 'ayesha@infinityhack.io',
      desc: 'Lead PM (UrbanCart Storefront lead)',
      badge: 'bg-blue-950 text-blue-300 border border-blue-800'
    },
    {
      role: 'AGENT',
      name: 'Ali Raza',
      email: 'ali@infinityhack.io',
      desc: 'Frontend Specialist (Product Catalog UI)',
      badge: 'bg-emerald-950 text-emerald-300 border border-emerald-800'
    },
    {
      role: 'AGENT',
      name: 'Sana Tariq',
      email: 'sana@infinityhack.io',
      desc: 'UI/UX & Frontend (Product Detail & Cart)',
      badge: 'bg-emerald-950 text-emerald-300 border border-emerald-800'
    },
    {
      role: 'AGENT',
      name: 'Usman Farooq',
      email: 'usman@infinityhack.io',
      desc: 'Backend Engineer (Stripe Payments)',
      badge: 'bg-emerald-950 text-emerald-300 border border-emerald-800'
    },
    {
      role: 'AGENT',
      name: 'Hira Malik',
      email: 'hira@infinityhack.io',
      desc: 'QA & Mobile (Cross-browser regression)',
      badge: 'bg-emerald-950 text-emerald-300 border border-emerald-800'
    }
  ];

  const handleLogin = async (loginEmail = email, loginPass = password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(loginEmail, loginPass);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Product Value & Demo Quick Logins */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>THE INFINITY HACK ’26</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              PulsePM
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              From meeting conversations to role-scoped execution plans in seconds. Powered by Google Gemini with deterministic anti-hallucination verification.
            </p>
          </div>

          {/* Judge Quick-Access Station */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                Live Demo One-Click Access (Judges)
              </span>
              <span className="text-[11px] font-mono text-zinc-500">Pass: infinity2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleLogin(account.email, 'infinity2026')}
                  disabled={loading}
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/90 text-left transition-all hover:border-zinc-700 space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {account.name}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${account.badge}`}>
                      {account.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{account.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Standard Credentials Form */}
        <div className="md:col-span-5 rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Sign In to Workspace</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Enter demo credentials or choose an account on the left</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-md text-xs text-rose-300">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs text-zinc-300 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@infinityhack.io"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300 font-medium">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-sm shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-[11px] text-zinc-500 text-center pt-2 border-t border-zinc-800">
            Pre-seeded with official Infinity ’26 demo accounts & roles
          </div>
        </div>
      </div>
    </div>
  );
};
