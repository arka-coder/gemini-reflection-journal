import React, { useState } from 'react';
import { FutureTrajectory, Pattern } from '../types';
import {
  Sparkles,
  GitBranch,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Compass,
  Clock,
  ArrowDown,
  Split,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ExplainabilityModal } from './ExplainabilityModal';

interface FutureMeProps {
  trajectories: FutureTrajectory[];
  patterns: Pattern[];
  onExploreInDecisionMode?: (trajectory: FutureTrajectory) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const FutureMe: React.FC<FutureMeProps> = ({
  trajectories,
  patterns,
  onExploreInDecisionMode,
  onRefresh,
  isLoading = false,
}) => {
  const [activeTrajectoryIndex, setActiveTrajectoryIndex] = useState(0);
  const [customAlternative, setCustomAlternative] = useState<string>('');
  const [showExplainModal, setShowExplainModal] = useState(false);

  const selectedTrajectory = trajectories[activeTrajectoryIndex] || trajectories[0];

  // Helper milestones derived from trajectory text
  const deriveMilestones = (possibleTrajectory: string) => {
    // Break into 3 progressive phases if not explicitly formatted
    const sentences = possibleTrajectory.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    return {
      day30: sentences[0] || 'Initial friction increases as recurring avoidance habits repeat.',
      month6: sentences[1] || 'Compounding delays create lingering backlog and reduced creative momentum.',
      month12: sentences[2] || 'Unconscious pattern risks solidifying into an ongoing default state.',
    };
  };

  const milestones = selectedTrajectory ? deriveMilestones(selectedTrajectory.possibleTrajectory) : null;

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      {/* Header & Epistemic Disclaimer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <Compass className="w-3.5 h-3.5" />
            <span>Future Trajectory Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Explore Possible Trajectories
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Extrapolate current behavioral vectors to visualize where patterns lead over 30 days, 6 months, and 12 months.
          </p>
        </div>

        {/* Epistemic Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-mono font-semibold">
            <span>SIMULATED POSSIBILITY</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">NOT A PREDICTION</span>
          </div>

          {onRefresh && (
            <button
              id="refresh-trajectories-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isLoading ? 'Simulating...' : 'Recalculate'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Trajectories Selector Tabs */}
      {trajectories.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {trajectories.map((traj, idx) => (
            <button
              key={traj.id || idx}
              onClick={() => {
                setActiveTrajectoryIndex(idx);
                setCustomAlternative('');
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-medium transition cursor-pointer border whitespace-nowrap flex items-center space-x-2 ${
                activeTrajectoryIndex === idx
                  ? 'bg-amber-500/20 border-amber-500/40 text-white shadow-lg'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="max-w-[180px] truncate">{traj.currentPattern}</span>
            </button>
          ))}
        </div>
      )}

      {selectedTrajectory && (
        <div className="space-y-8">
          {/* 1. VISUAL STEPPING TRAJECTORY TIMELINE */}
          <section className="rounded-3xl bg-white/[0.025] border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  PROJECTED PATH IF UNALTERED
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Longitudinal Extrapolation: "{selectedTrajectory.currentPattern}"
                </h3>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Timeframe horizon: {selectedTrajectory.timeframe || '12 months'}</span>
              </div>
            </div>

            {/* Vertical Flow Diagram with Connecting Lines */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[19px] sm:before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-purple-500 before:to-rose-500">
              {/* CURRENT PATTERN */}
              <div className="relative group">
                <div className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-4 h-4 rounded-full bg-[#090b10] border-2 border-amber-400 flex items-center justify-center shadow-lg" />
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider block">
                    CURRENT PATTERN
                  </span>
                  <p className="text-sm font-semibold text-white">
                    {selectedTrajectory.currentPattern}
                  </p>
                  <p className="text-xs text-slate-400 pt-0.5">
                    {selectedTrajectory.whyAiThinksThis}
                  </p>
                </div>
              </div>

              {/* 30 DAYS */}
              <div className="relative group">
                <div className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-4 h-4 rounded-full bg-[#090b10] border-2 border-amber-300 flex items-center justify-center shadow-lg" />
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-300 tracking-wider">
                      30 DAYS
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Immediate adjustments</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {milestones?.day30}
                  </p>
                </div>
              </div>

              {/* 6 MONTHS */}
              <div className="relative group">
                <div className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-4 h-4 rounded-full bg-[#090b10] border-2 border-purple-400 flex items-center justify-center shadow-lg" />
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-purple-300 tracking-wider">
                      6 MONTHS
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Compounding vector</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {milestones?.month6}
                  </p>
                </div>
              </div>

              {/* 12 MONTHS */}
              <div className="relative group">
                <div className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-4 h-4 rounded-full bg-[#090b10] border-2 border-rose-400 flex items-center justify-center shadow-lg" />
                <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-rose-300 tracking-wider">
                      12 MONTHS
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">Long-term systemic risk</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-100 leading-relaxed font-medium">
                    {milestones?.month12}
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence and Explainability Link */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setShowExplainModal(true)}
                className="text-slate-400 hover:text-amber-300 transition cursor-pointer flex items-center space-x-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="underline">[ Why am I seeing this? ]</span>
              </button>

              {selectedTrajectory.evidence && (
                <span className="text-[11px] font-mono text-slate-400">
                  Grounded in {selectedTrajectory.evidence.length} historical reflection observations
                </span>
              )}
            </div>
          </section>

          {/* 2. "CHANGE ONE VARIABLE" — VISUALLY DIVERGING PATHWAYS */}
          <section className="rounded-3xl bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.03] to-purple-500/[0.05] border border-emerald-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="space-y-1 pb-4 border-b border-white/10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                <Split className="w-3.5 h-3.5" />
                <span>CHANGE ONE VARIABLE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Divergent Future Branch
              </h2>
              <p className="text-xs text-slate-300">
                Altering a single cognitive or behavioral constraint creates a radically different trajectory.
              </p>
            </div>

            {/* Variable Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CURRENT VARIABLE */}
              <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                  Current Variable
                </span>
                <p className="text-sm font-semibold text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  "{selectedTrajectory.currentPattern}"
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Default tendency to avoid short-term discomfort, compounding friction over time.
                </p>
              </div>

              {/* ALTERNATIVE PIVOT VARIABLE */}
              <div className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                  Alternative Pivot Variable
                </span>
                <p className="text-sm font-semibold text-emerald-200 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/25">
                  "{selectedTrajectory.pivotVariable}"
                </p>
                <p className="text-xs text-emerald-300/80 leading-relaxed">
                  Proactively altering this specific lever to reverse compounding friction.
                </p>
              </div>
            </div>

            {/* DIVERGING VISUAL FORK */}
            <div className="rounded-2xl bg-[#0a0d14] border border-white/10 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10 pb-3">
                <span className="font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                  <Split className="w-4 h-4 text-emerald-400" />
                  <span>The Trajectories Diverge</span>
                </span>
                <span>Branching Comparison</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Branch A: Status Quo */}
                <div className="space-y-3 p-4 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                      Path A: Unaltered Vector
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Avoidance persists</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>Month 1: Delayed commitments build initial cognitive load.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>Month 6: Reduced momentum creates hesitation on major moves.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>Year 1: Heightened risk of feeling trapped by deferred decisions.</span>
                    </div>
                  </div>
                </div>

                {/* Branch B: With Single Variable Pivoted */}
                <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                      Path B: Pivoted Vector
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Active agency</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-200">
                    <div className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>Month 1: Early discomfort tolerated; decision speed increases.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>Month 6: Compounding wins rebuild self-trust and momentum.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>Year 1: Substantial creative autonomy and decisive confidence.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Handoff Action */}
            {onExploreInDecisionMode && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Ready to test these alternatives against your historical values?
                </span>
                <button
                  type="button"
                  id="stress-test-decision-btn"
                  onClick={() => onExploreInDecisionMode(selectedTrajectory)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
                >
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <span>Stress-Test in Decision Mode</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Explainability Modal */}
      {showExplainModal && selectedTrajectory && (
        <ExplainabilityModal
          data={{
            title: `Trajectory Rationale: "${selectedTrajectory.currentPattern}"`,
            commonTheme: 'Behavioral Vector Extrapolation',
            evidenceCount: selectedTrajectory.evidence?.length || 3,
            confidence: 81,
            evidence: (selectedTrajectory.evidence || []).map((ev, i) => ({
              id: `ev-${i}`,
              title: ev,
              date: Date.now() - 1000 * 60 * 60 * 24 * (i * 20 + 10),
              type: 'reflection',
              snippet: ev,
            })),
          }}
          onClose={() => setShowExplainModal(false)}
        />
      )}
    </div>
  );
};
