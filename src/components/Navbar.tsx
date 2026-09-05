import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Feather, LogOut, ShieldCheck, User as UserIcon, Brain, GitBranch, Sparkles, Compass } from 'lucide-react';
import { NavTab } from '../types';
export type { NavTab };

interface NavbarProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'journal', onTabChange }) => {
  const { user, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#090b10]/85 backdrop-blur-xl border-b border-white/10">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div
            id="brand-icon-container"
            onClick={() => onTabChange && onTabChange('journal')}
            className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-white shadow-lg shadow-emerald-500/5 backdrop-blur-md group cursor-pointer"
            title="Reflection Journal"
          >
            <Feather
              id="brand-icon"
              className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-base sm:text-lg tracking-tight">
                Reflection Journal
              </span>
              {/* Subtle secondary branding */}
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-slate-300 border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span>Powered by Gemini</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent reflection, pattern discovery & trajectory modeling
            </p>
          </div>
        </div>

        {/* Center Primary Navigation Tabs (When Authenticated) */}
        {user && onTabChange && (
          <nav className="flex items-center space-x-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            {/* 1. JOURNAL */}
            <button
              id="nav-tab-journal"
              onClick={() => onTabChange('journal')}
              title="Capture what you're thinking"
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-emerald-500/20 text-emerald-200 shadow-sm border border-emerald-500/35'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Feather className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">JOURNAL</span>
            </button>

            {/* 2. MIRROR */}
            <button
              id="nav-tab-mirror"
              onClick={() => onTabChange('mirror')}
              title="Understand what the AI has learned from your reflections"
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer relative ${
                activeTab === 'mirror'
                  ? 'bg-purple-500/20 text-purple-200 shadow-sm border border-purple-500/35'
                  : 'text-slate-400 hover:text-purple-200 hover:bg-purple-500/10 border border-transparent'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold">MIRROR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse hidden sm:inline-block ml-0.5" />
            </button>

            {/* 3. DECIDE */}
            <button
              id="nav-tab-decide"
              onClick={() => onTabChange('decide')}
              title="Use your reflections and patterns when thinking through important decisions"
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'decide'
                  ? 'bg-blue-500/20 text-blue-200 shadow-sm border border-blue-500/35'
                  : 'text-slate-400 hover:text-blue-200 hover:bg-blue-500/10 border border-transparent'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">DECIDE</span>
            </button>

            {/* 4. FUTURE */}
            <button
              id="nav-tab-future"
              onClick={() => onTabChange('future')}
              title="Explore possible trajectories based on different choices"
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'future'
                  ? 'bg-amber-500/20 text-amber-200 shadow-sm border border-amber-500/35'
                  : 'text-slate-400 hover:text-amber-200 hover:bg-amber-500/10 border border-transparent'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">FUTURE</span>
            </button>
          </nav>
        )}

        {/* User profile & controls */}
        {user ? (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Isolated Vault</span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 border-l border-white/10">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-white/20 object-cover shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.displayName}
                </div>
                <div className="text-[11px] text-slate-400 max-w-[120px] truncate">
                  {user.email}
                </div>
              </div>

              <button
                id="sign-out-btn"
                onClick={signOutUser}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};
