import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Feather, Shield, Lock, BrainCircuit, BookOpen, ArrowRight, CheckCircle2, AlertCircle, Compass, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { signInWithGoogle, authError, clearAuthError } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-transparent text-slate-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full space-y-16">
        {/* Auth Error Banner if any */}
        {authError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-3 text-rose-200 text-sm backdrop-blur-md shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Authentication Notice:</span> {authError}
            </div>
            <button
              onClick={clearAuthError}
              className="text-rose-300 hover:text-white text-xs font-semibold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Subtle Live Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-emerald-400 mb-6 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>End-to-End User Isolated Cloud Firestore Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.12]">
            Your private space to{' '}
            <span className="font-editorial italic font-normal text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              reflect, clarify,
            </span>{' '}
            and grow.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto font-normal">
            Express your thoughts freely in a quiet, distraction-free sanctuary. Engage in multi-turn introspective dialogue powered by Gemini 3.8 Flash, permanently isolated to your personal vault.
          </p>

          {/* Primary Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="google-signin-btn"
              onClick={signInWithGoogle}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-3.5 bg-emerald-500/20 hover:bg-emerald-500/25 text-white font-medium rounded-xl border border-emerald-500/35 backdrop-blur-xl shadow-[0_4px_24px_rgba(16,185,129,0.18)] hover:shadow-[0_4px_32px_rgba(16,185,129,0.28)] hover:border-emerald-400/50 transition-all duration-200 cursor-pointer text-sm sm:text-base group"
            >
              {/* Google G SVG */}
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.43 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.41l4.04-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.57 1.24 6.59l4.04 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span>Sign in with Google</span>
              <ArrowRight className="w-4 h-4 ml-1 text-emerald-300 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4 flex items-center justify-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero passwords stored or handled. Authenticated via Google OAuth.</span>
          </p>
        </div>

        {/* INTERACTIVE JOURNAL PREVIEW MOCKUP */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="relative rounded-2xl bg-white/[0.025] border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Ambient interior glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none" />

            {/* Mockup Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Feather className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    Calibrating Long-Term Direction vs. Immediate Urgency
                  </h3>
                  <p className="text-xs text-slate-400">Written today at 7:42 AM • 184 words</p>
                </div>
              </div>

              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                <Compass className="w-3 h-3" />
                <span>Reflective</span>
              </div>
            </div>

            {/* Mockup Journal Excerpt */}
            <div className="py-5 font-editorial text-lg text-slate-200 leading-relaxed italic border-b border-white/10">
              "I realized this morning that moving quickly is not the same as moving in the right direction. When urgent emails and tactical tasks dominate the day, it feels like productivity—but deep progress requires stepping back to protect uninterrupted focus for what truly matters."
            </div>

            {/* Mockup Gemini Response */}
            <div className="pt-5 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemini 3.8 Flash Reflection:</span>
              </div>

              <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-4 text-sm text-slate-200 leading-relaxed space-y-2">
                <p>
                  You've drawn a vital distinction between <strong>velocity</strong> and <strong>vector</strong>. Notice how urgency often creates an illusion of momentum that temporarily numbs anxiety about larger, ambiguous goals.
                </p>
                <p className="text-xs text-slate-300 italic border-l-2 border-emerald-400/50 pl-3 pt-1">
                  "If you could protect just 60 minutes of uninterrupted calm tomorrow morning before opening your inbox, what single high-leverage decision would you dedicate it to?"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars / Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Pillar 1 */}
          <div className="bg-white/[0.025] backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-slate-300 mb-4 transition-transform duration-200 group-hover:scale-110">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Gemini 3.8 Flash Engine</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Engage in multi-turn dialogues. Request deep reflections, key thematic summaries, or creative brainstorming with automated model fallback resilience.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white/[0.025] backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl hover:border-blue-500/30 hover:bg-white/[0.04] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-slate-300 mb-4 transition-transform duration-200 group-hover:scale-110">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Strict Firestore Isolation</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Enforced by database-level security rules. Entries and conversation turns are permanently bound to your Google User ID path (<code className="text-xs bg-white/10 border border-white/10 px-1 py-0.5 rounded text-slate-200 font-mono">/users/&#123;uid&#125;</code>).
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white/[0.025] backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/30 hover:bg-white/[0.04] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-slate-300 mb-4 transition-transform duration-200 group-hover:scale-110">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Organized Vault History</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Browse through your reflections over time. Filter by keywords or mood, and review how your thinking has evolved across weeks and months.
            </p>
          </div>
        </div>

        {/* Security Invariants Callout */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 max-w-3xl mx-auto text-left shadow-xl">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security & Privacy Invariants</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero client exposure of Gemini API keys</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Resilient multi-model API fallback ladder</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Database rules reject cross-tenant access</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-crash sanitized document payloads</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
        Built with Google AI Studio • Gemini 3.8 Flash • Cloud Firestore & Firebase Auth
      </footer>
    </div>
  );
};

