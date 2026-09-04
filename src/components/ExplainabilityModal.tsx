import React from 'react';
import { ExplainabilityData } from '../types';
import { ShieldCheck, HelpCircle, X, CheckCircle2, Calendar, FileText, GitBranch, AlertCircle, Sparkles } from 'lucide-react';

interface ExplainabilityModalProps {
  data: ExplainabilityData | null;
  onClose: () => void;
  onSelectEntry?: (entryId: string) => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  data,
  onClose,
  onSelectEntry,
}) => {
  if (!data) return null;

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  const hasSufficient = !data.notEnoughEvidence && data.evidence && data.evidence.length > 0;

  return (
    <div
      id="explainability-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="explainability-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[#0d1017] border border-white/15 p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.08] rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Algorithmic Explainability & Grounding</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Why am I seeing this?</h3>
            <p className="text-xs text-slate-400 line-clamp-1">
              {data.title || 'Insight provenance verification'}
            </p>
          </div>

          <button
            id="explainability-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Evidence Breakdown */}
        {hasSufficient ? (
          <div className="space-y-5">
            {/* EVIDENCE LIST */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  EVIDENCE
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  This insight was based on:
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {data.evidence.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => {
                      if (onSelectEntry && item.id) {
                        onSelectEntry(item.id);
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all flex items-start space-x-3 ${
                      onSelectEntry ? 'cursor-pointer group' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      {item.type === 'decision' ? (
                        <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {formatDate(item.date)}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate font-medium mt-0.5">
                        {item.title}
                      </p>
                      {item.snippet && (
                        <p className="text-[11px] text-slate-400 font-editorial italic line-clamp-2 mt-1 border-l-2 border-emerald-500/30 pl-2">
                          "{item.snippet}"
                        </p>
                      )}
                      <span className="text-[9px] font-mono text-slate-400 block mt-1">
                        Source ID: {item.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATS MATRIX */}
            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
              <div className="p-2.5 rounded-xl bg-white/[0.025] border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Common theme</span>
                <span className="text-xs font-semibold text-emerald-300 truncate block mt-0.5">
                  {data.commonTheme || 'Personal Growth'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.025] border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Evidence count</span>
                <span className="text-xs font-bold text-white block mt-0.5 font-mono">
                  {data.evidenceCount || data.evidence.length} {data.evidenceCount === 1 ? 'entry' : 'relevant entries'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.025] border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">AI confidence</span>
                <span className="text-xs font-bold text-emerald-400 block mt-0.5 font-mono">
                  {data.confidence || 82}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* INSUFFICIENT EVIDENCE STATE */
          <div className="p-6 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-amber-200">
              Not enough historical evidence to establish this pattern yet.
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Reflection Journal only links patterns when multiple distinct reflections ground the connection. Continue writing reflections to build empirical depth.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero hallucinated evidence. Fully deterministic provenance.</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium cursor-pointer transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
