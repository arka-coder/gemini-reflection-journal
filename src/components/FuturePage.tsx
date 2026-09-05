import React, { useState, useEffect } from 'react';
import { DecisionItem, DecisionOption, JournalEntry, MemoryItem, FutureTrajectory, Pattern } from '../types';
import { FutureMe } from './FutureMe';
import {
  Compass,
  GitBranch,
  Sparkles,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Scale,
  RefreshCw,
  Layers,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

interface FuturePageProps {
  userId: string;
  decisions: DecisionItem[];
  entries: JournalEntry[];
  memories: MemoryItem[];
  patterns?: Pattern[];
  trajectories?: FutureTrajectory[];
  onSaveDecision: (decision: DecisionItem) => Promise<void>;
  onNavigateToDecide: (context?: any) => void;
  onNavigateToJournal?: () => void;
  onRefreshTrajectories?: () => Promise<void>;
}

export const FuturePage: React.FC<FuturePageProps> = ({
  userId,
  decisions,
  entries,
  memories,
  patterns = [],
  trajectories = [],
  onSaveDecision,
  onNavigateToDecide,
  onNavigateToJournal,
  onRefreshTrajectories,
}) => {
  // Select which decision to view in Future page
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>(() => {
    // Default to the first decision with options, or first decision
    const withOptions = decisions.find((d) => d.options && d.options.length > 0);
    if (withOptions) return withOptions.id;
    return decisions[0]?.id || '';
  });

  // Keep selectedDecisionId in sync when decisions change
  useEffect(() => {
    if (!selectedDecisionId && decisions.length > 0) {
      const withOptions = decisions.find((d) => d.options && d.options.length > 0);
      setSelectedDecisionId(withOptions ? withOptions.id : decisions[0].id);
    }
  }, [decisions, selectedDecisionId]);

  const activeDecision = decisions.find((d) => d.id === selectedDecisionId) || decisions[0];

  // Selected Option inside the active decision
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [activeViewMode, setActiveViewMode] = useState<'branching' | 'scorecards' | 'comparison' | 'pressureTest' | 'behavioral'>('branching');
  const [inspectingEvidence, setInspectingEvidence] = useState(false);

  // Gemini Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Loading message sequence as required:
  // "Mapping possible futures...", "Comparing possible outcomes...", "Building your trajectory..."
  const LOADING_STEPS = [
    'Mapping possible futures...',
    'Comparing possible outcomes...',
    'Building your trajectory...',
  ];

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Current option derived safely
  const currentOption: DecisionOption | undefined =
    activeDecision?.options?.find((opt) => opt.id === selectedOptionId) ||
    activeDecision?.options?.[0];

  // Trigger simulation for the currently active decision
  const handleSimulateDecision = async (decisionToSimulate?: DecisionItem) => {
    const target = decisionToSimulate || activeDecision;
    if (!target || !target.title?.trim()) {
      onNavigateToDecide();
      return;
    }

    setIsSimulating(true);
    setSimulationError(null);
    setLoadingStepIndex(0);

    try {
      const res = await fetch('/api/gemini/decision-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle: target.title,
          context: target.context,
          category: target.category || 'career',
          options: target.options || [],
          pastEntries: entries.slice(0, 10),
          memories,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (data.decision) {
        const updatedDecision: DecisionItem = {
          ...target,
          options: data.decision.options || target.options || [],
          historicalContext: data.decision.historicalContext || target.historicalContext,
          pressureTest: data.decision.pressureTest || target.pressureTest,
          updatedAt: Date.now(),
        };

        await onSaveDecision(updatedDecision);
        if (updatedDecision.options.length > 0) {
          setSelectedOptionId(updatedDecision.options[0].id);
        }
      }
    } catch (err: any) {
      console.error('Future simulation failed:', err);
      setSimulationError(err?.message || 'Connection error while communicating with Gemini.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Determine if active decision has valid future simulation data
  const hasFutureSimulationData = Boolean(
    activeDecision && activeDecision.options && activeDecision.options.length > 0
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8 max-w-6xl mx-auto w-full pb-20">
      {/* 1. TOP HEADER (Always rendered, never blank) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>FUTURE</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Powered by Gemini
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Explore where your choices could take you.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Simulate branching pathways, project 3-horizon timelines, compare probability-weighted outcomes, and test behavioral trajectories.
          </p>
        </div>

        {/* Epistemic Badges & Simulation Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-mono font-medium">
            <span>SIMULATED POSSIBILITY</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">NOT A PREDICTION</span>
          </div>

          {hasFutureSimulationData && !isSimulating && (
            <button
              id="re-simulate-future-btn"
              onClick={() => handleSimulateDecision()}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs font-semibold transition cursor-pointer shadow-sm"
              title="Re-run simulation with Gemini to explore fresh outcomes"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Re-Simulate Future</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. LOADING STATE (During Gemini Simulation) */}
      {isSimulating && (
        <div className="rounded-3xl bg-white/[0.025] border border-amber-500/20 p-8 sm:p-12 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-amber-400/20 blur-sm -z-10 animate-ping opacity-30" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {LOADING_STEPS[loadingStepIndex]}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Synthesizing your past reflections, personal values, and option branches into 1-month, 6-month, and 2-year horizon simulations.
            </p>
          </div>

          {/* Stepping Indicator Pills */}
          <div className="flex items-center space-x-2 pt-2">
            {LOADING_STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  loadingStepIndex === idx
                    ? 'w-8 bg-amber-400 shadow-xs shadow-amber-400/50'
                    : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. ERROR STATE (Gemini Failure) */}
      {!isSimulating && simulationError && (
        <div className="rounded-3xl bg-rose-500/[0.04] border border-rose-500/30 p-8 sm:p-10 backdrop-blur-xl shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">
              Your future simulation couldn't be generated right now.
            </h3>
            <p className="text-xs text-rose-200/80">
              {simulationError}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="try-again-simulation-btn"
              onClick={() => handleSimulateDecision()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-100 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-lg"
            >
              <RefreshCw className="w-4 h-4 text-rose-300" />
              <span>Try Again</span>
            </button>

            <button
              onClick={() => onNavigateToDecide()}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              Explore a Decision
            </button>
          </div>
        </div>
      )}

      {/* 4. EMPTY STATE (When no decision is active, or decision has not been simulated) */}
      {!isSimulating && !simulationError && !hasFutureSimulationData && (
        <div className="rounded-3xl bg-white/[0.025] border border-white/10 p-8 sm:p-12 backdrop-blur-xl shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <GitBranch className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block">
              FUTURE
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Explore where your choices could take you.
            </h3>
            <p className="text-sm text-slate-300 font-medium">
              "No active decision is being simulated yet."
            </p>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Select or draft a decision dilemma to project branching trajectories, scorecards, timeline horizons, and pre-mortem failure stress-tests.
            </p>
          </div>

          {/* Action to Explore a Decision */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              id="explore-decision-btn"
              onClick={() => onNavigateToDecide()}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/35 text-amber-100 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-lg backdrop-blur-md"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Explore a Decision</span>
            </button>

            {activeDecision && activeDecision.title && (
              <button
                onClick={() => handleSimulateDecision(activeDecision)}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/35 text-blue-100 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Simulate: "{activeDecision.title}"</span>
              </button>
            )}
          </div>

          {/* Quick Picker if other decisions exist */}
          {decisions.length > 1 && (
            <div className="pt-6 border-t border-white/10 max-w-md mx-auto space-y-2">
              <span className="text-[11px] uppercase font-mono text-slate-500">Or choose another recorded decision:</span>
              <div className="flex flex-col gap-2">
                {decisions.map((dec) => (
                  <button
                    key={dec.id}
                    onClick={() => {
                      setSelectedDecisionId(dec.id);
                      if (dec.options && dec.options.length > 0) {
                        setSelectedOptionId(dec.options[0].id);
                      }
                    }}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-left text-xs text-slate-300 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="font-medium text-white truncate max-w-[280px]">{dec.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{dec.options?.length || 0} options</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. ACTIVE FUTURE SIMULATION (Rendered when decision options & simulation exist) */}
      {!isSimulating && !simulationError && hasFutureSimulationData && activeDecision && (
        <div className="space-y-8">
          {/* Decision Context Card & Selector */}
          <section className="bg-white/[0.025] backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
                    {activeDecision.category || 'career'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Status: <strong className="text-slate-300 capitalize">{activeDecision.status || 'evaluating'}</strong>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeDecision.title}
                </h2>
                {activeDecision.context && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl pt-1">
                    {activeDecision.context}
                  </p>
                )}
              </div>

              {/* Decision Switcher Dropdown (if multiple) */}
              {decisions.length > 1 && (
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-mono text-slate-400">Switch:</label>
                  <select
                    value={activeDecision.id}
                    onChange={(e) => {
                      setSelectedDecisionId(e.target.value);
                      const targetDec = decisions.find((d) => d.id === e.target.value);
                      if (targetDec?.options && targetDec.options.length > 0) {
                        setSelectedOptionId(targetDec.options[0].id);
                      }
                    }}
                    className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500/40"
                  >
                    {decisions.map((dec) => (
                      <option key={dec.id} value={dec.id} className="bg-slate-900 text-white">
                        {dec.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Sub-Navigation Tabs & View Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Option Selector Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {activeDecision.options.map((opt, idx) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      (selectedOptionId === opt.id || (!selectedOptionId && idx === 0))
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-100 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.title}
                  </button>
                ))}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center space-x-1 bg-white/[0.03] border border-white/10 p-1 rounded-xl">
                <button
                  onClick={() => setActiveViewMode('branching')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeViewMode === 'branching' ? 'bg-white/10 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Branching Map
                </button>
                <button
                  onClick={() => setActiveViewMode('scorecards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeViewMode === 'scorecards' ? 'bg-white/10 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Scorecards
                </button>
                <button
                  onClick={() => setActiveViewMode('comparison')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeViewMode === 'comparison' ? 'bg-white/10 text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Comparison Matrix
                </button>
                <button
                  onClick={() => setActiveViewMode('pressureTest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    activeViewMode === 'pressureTest' ? 'bg-rose-500/20 text-rose-200 shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pressure Test
                </button>
                {trajectories.length > 0 && (
                  <button
                    onClick={() => setActiveViewMode('behavioral')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      activeViewMode === 'behavioral' ? 'bg-purple-500/20 text-purple-200 shadow-sm font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Behavioral Trajectories
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* HISTORICAL CONTEXT BANNER */}
          {activeDecision.historicalContext && (
            <section className="bg-emerald-500/[0.05] border border-emerald-500/25 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider font-mono">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Something From Your Past May Be Relevant</span>
                </div>

                <button
                  onClick={() => setInspectingEvidence(!inspectingEvidence)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
                >
                  {inspectingEvidence ? 'Hide Evidence' : 'Inspect Historical Evidence'}
                </button>
              </div>

              <p className="text-xs text-emerald-100 leading-relaxed font-editorial italic text-sm">
                "{activeDecision.historicalContext.advisoryNote}"
              </p>

              {inspectingEvidence && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-500/20 text-xs text-slate-200">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Previous Decisions:</span>
                    <ul className="space-y-1 text-slate-300">
                      {activeDecision.historicalContext.relevantPreviousDecisions?.map((item, i) => (
                        <li key={i} className="line-clamp-2">• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] p-3 rounded-xl border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Recurring Core Values:</span>
                    <ul className="space-y-1 text-slate-300">
                      {activeDecision.historicalContext.recurringValues?.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] p-3 rounded-xl border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Unresolved Tensions:</span>
                    <ul className="space-y-1 text-slate-300">
                      {activeDecision.historicalContext.unresolvedTensions?.map((item, i) => (
                        <li key={i} className="line-clamp-2">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* VIEW MODE 1: BRANCHING TIMELINE MAP */}
          {activeViewMode === 'branching' && currentOption && (
            <div className="bg-white/[0.025] backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">{currentOption.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{currentOption.description}</p>
              </div>

              {/* 3 Horizon Timeline Projections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>1 Month Horizon</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Immediate Impact</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{currentOption.timeline1Mo}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>6 Months Horizon</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Systemic Habit</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{currentOption.timeline6Mo}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-400">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>2 Years Horizon</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Identity Trajectory</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{currentOption.timeline2Yr}</p>
                </div>
              </div>

              {/* Sub-Branch Scenarios */}
              {currentOption.branches && currentOption.branches.length > 0 && (
                <div className="space-y-3 pt-3">
                  <span className="text-xs uppercase font-semibold text-slate-400 font-mono">Branching Sub-Scenarios:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentOption.branches.map((br) => (
                      <div key={br.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{br.label}</span>
                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                              br.riskProbability === 'low'
                                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                                : br.riskProbability === 'high'
                                ? 'text-rose-300 bg-rose-500/10 border-rose-500/20'
                                : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                            }`}
                          >
                            Risk: {br.riskProbability}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{br.outcomeScenario}</p>
                        <p className="text-[11px] text-slate-400 italic pt-1">
                          Emotional Payoff: {br.emotionalPayoff}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: SCORECARDS */}
          {activeViewMode === 'scorecards' && currentOption && (
            <div className="bg-white/[0.025] backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
              <h3 className="text-base font-bold text-white">Scorecard: {currentOption.title}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Risk Factor', score: currentOption.scorecard?.riskScore || 5, color: 'text-rose-400', bar: 'bg-rose-500' },
                  { label: 'Long-Term Fulfillment', score: currentOption.scorecard?.fulfillmentScore || 8, color: 'text-emerald-400', bar: 'bg-emerald-500' },
                  { label: 'Reversibility', score: currentOption.scorecard?.reversibilityScore || 6, color: 'text-blue-400', bar: 'bg-blue-500' },
                  { label: 'Values Alignment', score: currentOption.scorecard?.valuesAlignmentScore || 9, color: 'text-purple-400', bar: 'bg-purple-500' },
                ].map((sc, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">{sc.label}</span>
                      <span className={`text-lg font-bold ${sc.color}`}>{sc.score}/10</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full ${sc.bar}`} style={{ width: `${sc.score * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase font-mono">Upsides & Alignment:</span>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {currentOption.pros?.map((p, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/[0.04] border border-rose-500/20 space-y-2">
                  <span className="text-xs font-semibold text-rose-400 uppercase font-mono">Downsides & Friction:</span>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {currentOption.cons?.map((c, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: SIDE-BY-SIDE COMPARISON */}
          {activeViewMode === 'comparison' && (
            <div className="bg-white/[0.025] backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4 overflow-x-auto">
              <h3 className="text-base font-bold text-white">Side-by-Side Scenario Matrix</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[500px]">
                {activeDecision.options.map((opt) => (
                  <div key={opt.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{opt.title}</h4>
                      <span className="text-xs font-mono text-purple-400">
                        {opt.scorecard?.valuesAlignmentScore}/10 Alignment
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{opt.description}</p>

                    <div className="space-y-2 text-xs border-t border-white/10 pt-3">
                      <div className="flex justify-between text-slate-400">
                        <span>Risk Factor:</span>
                        <span className="text-white font-bold">{opt.scorecard?.riskScore}/10</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Fulfillment:</span>
                        <span className="text-white font-bold">{opt.scorecard?.fulfillmentScore}/10</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Reversibility:</span>
                        <span className="text-white font-bold">{opt.scorecard?.reversibilityScore}/10</span>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-mono text-slate-400">6-Month Systemic Impact:</span>
                      <p className="text-slate-200">{opt.timeline6Mo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 4: PRESSURE TESTING (PRE-MORTEM) */}
          {activeViewMode === 'pressureTest' && activeDecision.pressureTest && (
            <div className="bg-rose-500/[0.03] backdrop-blur-xl rounded-3xl border border-rose-500/25 p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center space-x-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  Pre-Mortem Failure Stress-Test
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <span className="text-xs font-semibold text-rose-300 uppercase font-mono">
                  Simulated Failure Scenario (18 Months Out):
                </span>
                <p className="text-xs text-rose-100 leading-relaxed font-editorial italic text-sm">
                  "{activeDecision.pressureTest.preMortemFailureScenario}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <span className="text-xs font-semibold text-amber-300 uppercase font-mono">
                  Hidden Assumption / Blind Spot Warning:
                </span>
                <p className="text-xs text-amber-100 leading-relaxed">
                  {activeDecision.pressureTest.blindSpotWarning}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <span className="text-xs font-semibold text-emerald-300 uppercase font-mono">
                  Recommended Proactive Hedge / Safety Net:
                </span>
                <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                  {activeDecision.pressureTest.mitigationStrategy}
                </p>
              </div>
            </div>
          )}

          {/* VIEW MODE 5: BEHAVIORAL TRAJECTORIES (FUTURE ME) */}
          {activeViewMode === 'behavioral' && (
            <FutureMe
              trajectories={trajectories}
              patterns={patterns}
              onExploreInDecisionMode={(traj) => {
                onNavigateToDecide({
                  title: `Trajectory Exploration: ${traj.currentPattern}`,
                  context: `Investigating the trajectory: "${traj.possibleTrajectory}". Pivot variable to test: ${traj.pivotVariable}`,
                  category: 'career',
                });
              }}
              onRefresh={onRefreshTrajectories}
            />
          )}
        </div>
      )}
    </div>
  );
};
