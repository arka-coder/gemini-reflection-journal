import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { RefreshCw } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative z-10 text-slate-300">
        <div className="p-8 rounded-2xl glass-card flex flex-col items-center shadow-2xl border border-white/10 backdrop-blur-xl">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-3" />
          <p className="text-xs font-medium text-slate-300">Checking secure authentication status...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#090b10] flex flex-col text-slate-100 relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Ambient atmospheric lighting & subtle canvas texture */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle noise-like geometric dot grid */}
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Soft Aurora glows */}
          <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] bg-emerald-500/[0.07] rounded-full blur-[120px]" />
          <div className="absolute top-1/4 -right-40 w-[42rem] h-[42rem] bg-indigo-500/[0.06] rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 left-1/4 w-[38rem] h-[38rem] bg-teal-500/[0.06] rounded-full blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <MainContent />
        </div>
      </div>
    </AuthProvider>
  );
}
