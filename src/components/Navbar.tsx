import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Feather, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#0c0e14]/70 backdrop-blur-xl border-b border-white/10">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div
            id="brand-icon-container"
            className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-white shadow-lg shadow-emerald-500/5 backdrop-blur-md group"
          >
            <Feather
              id="brand-icon"
              className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white text-lg tracking-tight">Gemini Reflection Journal</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Private reflective workspace backed by Cloud Firestore</p>
          </div>
        </div>

        {/* User profile & controls */}
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Isolated User Vault</span>
            </div>

            <div className="flex items-center space-x-3 pl-2 border-l border-white/10">
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
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.displayName}
                </div>
                <div className="text-[11px] text-slate-400 max-w-[140px] truncate">
                  {user.email}
                </div>
              </div>

              <button
                id="sign-out-btn"
                onClick={signOutUser}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
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
