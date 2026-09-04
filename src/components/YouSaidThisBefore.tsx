import React, { useState } from 'react';
import { YouSaidThisBeforeItem } from '../types';
import { Sparkles, Clock, ArrowRight, History, HelpCircle, ExternalLink } from 'lucide-react';
import { ExplainabilityModal } from './ExplainabilityModal';

interface YouSaidThisBeforeProps {
  item: YouSaidThisBeforeItem;
  onViewOriginal?: (entryId: string) => void;
  className?: string;
}

export const YouSaidThisBefore: React.FC<YouSaidThisBeforeProps> = ({
  item,
  onViewOriginal,
  className = '',
}) => {
  const [showExplainability, setShowExplainability] = useState(false);

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Past Reflection';
    }
  };

  return (
    <>
      <section
        id={`you-said-this-before-${item.id}`}
        className={`relative rounded-3xl bg-gradient-to-br from-purple-500/[0.08] via-white/[0.03] to-emerald-500/[0.04] border border-purple-500/25 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5 overflow-hidden transition-all duration-300 hover:border-purple-500/40 ${className}`}
      >
        {/* Subtle radial ambient highlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/[0.06] rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <History className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase font-mono">
                YOU SAID THIS BEFORE
              </h2>
            </div>
            <p className="text-xs text-purple-200/90 font-medium">
              "Something you wrote previously may be relevant."
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              Theme: <span className="text-purple-300 font-semibold">{item.commonTheme}</span>
            </span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200">
              AI confidence · {item.confidence}%
            </span>
          </div>
        </div>

        {/* THEN vs NOW Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* THEN (Historical Reflection) */}
          <div className="rounded-2xl bg-white/[0.025] border border-white/10 p-4 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-purple-300">
                  THEN
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(item.historicalDate)}</span>
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-200 font-editorial italic leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                "{item.historicalExcerpt}"
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="truncate max-w-[200px] font-medium text-slate-300">
                From: {item.historicalEntryTitle}
              </span>
              {onViewOriginal && (
                <button
                  type="button"
                  onClick={() => onViewOriginal(item.historicalEntryId)}
                  className="inline-flex items-center space-x-1 text-purple-300 hover:text-purple-200 font-semibold cursor-pointer underline"
                >
                  <span>[ View Original ]</span>
                </button>
              )}
            </div>
          </div>

          {/* NOW (Current Reflection) */}
          <div className="rounded-2xl bg-white/[0.025] border border-white/10 p-4 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-emerald-400">
                  NOW
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(item.currentDate)}</span>
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-200 font-editorial italic leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                "{item.currentExcerpt}"
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center">
              <span className="text-emerald-400 font-medium">Recent entry</span>
            </div>
          </div>
        </div>

        {/* WHAT CHANGED & WHAT STAYED THE SAME */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-purple-500/[0.05] border border-purple-500/20 space-y-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
              WHAT CHANGED
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {item.whatChanged}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              WHAT STAYED THE SAME
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {item.whatStayedTheSame}
            </p>
          </div>
        </div>

        {/* Footer Actions: [ View Original ] & [ Why am I seeing this? ] */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <button
            type="button"
            id={`why-seeing-this-btn-${item.id}`}
            onClick={() => setShowExplainability(true)}
            className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span className="underline">[ Why am I seeing this? ]</span>
          </button>

          {onViewOriginal && (
            <button
              type="button"
              id={`view-original-btn-${item.id}`}
              onClick={() => onViewOriginal(item.historicalEntryId)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/30 transition cursor-pointer font-medium"
            >
              <span>View Original Entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* Explainability Modal */}
      {showExplainability && (
        <ExplainabilityModal
          data={{
            title: `Historical Reflection Connection: "${item.commonTheme}"`,
            commonTheme: item.commonTheme,
            evidenceCount: 2,
            confidence: item.confidence,
            evidence: [
              {
                id: item.historicalEntryId,
                title: item.historicalEntryTitle,
                date: item.historicalDate,
                type: 'reflection',
                snippet: item.historicalExcerpt,
              },
              {
                id: item.currentEntryId || 'current-entry',
                title: 'Current Reflection',
                date: item.currentDate,
                type: 'reflection',
                snippet: item.currentExcerpt,
              },
            ],
          }}
          onClose={() => setShowExplainability(false)}
          onSelectEntry={(id) => {
            if (onViewOriginal) onViewOriginal(id);
          }}
        />
      )}
    </>
  );
};
