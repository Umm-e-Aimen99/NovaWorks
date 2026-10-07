import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api/client';
import { Shield, UserCheck, Briefcase, LogOut, ChevronDown, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface TopNavProps {
  user: User;
  onUserChange: (user: User) => void;
  onLogout: () => void;
  onRefreshData?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ user, onUserChange, onLogout, onRefreshData }) => {
  const [switching, setSwitching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const demoAccounts = [
    { email: 'admin@infinityhack.io', name: 'Executive Admin', role: 'ADMIN', badge: 'Admin (Full Access)' },
    { email: 'ayesha@infinityhack.io', name: 'Ayesha Khan', role: 'MANAGER', badge: 'Manager (UrbanCart Lead)' },
    { email: 'bilal@infinityhack.io', name: 'Bilal Ahmed', role: 'MANAGER', badge: 'Manager (Technical PM)' },
    { email: 'ali@infinityhack.io', name: 'Ali Raza', role: 'AGENT', badge: 'Agent (Frontend / Catalog)' },
    { email: 'sana@infinityhack.io', name: 'Sana Tariq', role: 'AGENT', badge: 'Agent (UI/UX / Cart)' },
    { email: 'usman@infinityhack.io', name: 'Usman Farooq', role: 'AGENT', badge: 'Agent (Backend / Stripe)' },
    { email: 'hira@infinityhack.io', name: 'Hira Malik', role: 'AGENT', badge: 'Agent (QA / Mobile)' },
  ];

  const handleQuickSwitch = async (email: string) => {
    try {
      setSwitching(true);
      const res = await api.login(email, 'infinity2026');
      onUserChange(res.user);
      setDropdownOpen(false);
      showNotification(`Switched role to ${res.user.name} (${res.user.role})`);
    } catch (err: any) {
      alert('Failed to switch demo account: ' + err.message);
    } finally {
      setSwitching(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset database to clean initial demo state? (Clears created projects/tasks)')) return;
    try {
      await api.resetDemo();
      showNotification('Database reset to clean demo seed.');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert('Reset failed: ' + err.message);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-950/80 text-purple-300 border border-purple-800/60';
      case 'MANAGER':
        return 'bg-blue-950/80 text-blue-300 border border-blue-800/60';
      case 'AGENT':
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60';
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/20 font-bold text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-white text-base">PulsePM</span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50">
                Infinity ’26
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none">Meeting to Execution in Seconds</p>
          </div>
        </div>

        {/* Global Banner Notification */}
        {notification && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 text-xs text-emerald-300 bg-emerald-950/70 border border-emerald-800/60 rounded-md animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Right Controls: Role Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher Dropdown (Judge Favorite!) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={switching}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-md transition-colors"
              title="Instantly switch between demo roles for live evaluation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Role Switcher:</span>
              <span className="font-semibold text-white">{user.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl py-1 z-50 divide-y divide-zinc-800/80">
                <div className="px-3 py-2 text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-300">Switch Demo Role (Judge Quick-Test)</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Test role-based access restrictions live</p>
                </div>

                <div className="py-1">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleQuickSwitch(account.email)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-800/80 flex items-center justify-between transition-colors ${
                        user.email === account.email ? 'bg-zinc-800/50 text-indigo-300 font-medium' : 'text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-zinc-200">{account.name}</div>
                        <div className="text-[10px] text-zinc-500">{account.badge}</div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${getRoleBadge(account.role)}`}>
                        {account.role}
                      </span>
                    </button>
                  ))}
                </div>

                {user.role === 'ADMIN' && (
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleResetDemoData();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-950/40 rounded flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-amber-400" />
                      <span>Reset Clean Demo State</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-medium text-zinc-200">{user.name}</div>
              <div className="text-[10px] text-zinc-500">{user.specialization}</div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${getRoleBadge(user.role)}`}>
              {user.role}
            </span>
            <button
              onClick={onLogout}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
