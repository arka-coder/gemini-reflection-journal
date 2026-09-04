import React, { useState } from 'react';
import { DecisionItem, DecisionOption, JournalEntry, MemoryItem } from '../types';
import {
  GitBranch,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Save,
  Trash2,
  ArrowRight,
  BookOpen,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Layers,
  Compass,
} from 'lucide-react';

interface DecisionWorkspaceProps {
  userId: string;
  decisions: DecisionItem[];
  entries: JournalEntry[];
  memories: MemoryItem[];
  onSaveDecision: (decision: DecisionItem) => Promise<void>;
  onDeleteDecision: (decisionId: string) => Promise<void>;
  initialContext?: { title?: string; context?: string; category?: any };
}

export const DecisionWorkspace: React.FC<DecisionWorkspaceProps> = ({
  userId,
  decisions,
  entries,
  memories,
  onSaveDecision,
  onDeleteDecision,
  initialContext,
}) => {
  const [activeDecision, setActiveDecision] = useState<DecisionItem>(() => {
    if (decisions.length > 0) return decisions[0];
    return {
      id: `dec-${Date.now()}`,
      userId,
      title: initialContext?.title || '',
      context: initialContext?.context || '',
      category: initialContext?.category || 'career',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      options: [],
    };
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'branching' | 'scorecards' | 'comparison' | 'pressureTest'>('branching');
  const [inspectingEvidence, setInspectingEvidence] = useState(false);

  // Trigger Gemini Future-Path & Decision Intelligence Simulation
  const handleSimulateDecision = async () => {
    if (!activeDecision.title.trim()) return;
    setIsSimulating(true);
    setSimulationError(null);

    try {
      const res = await fetch('/api/gemini/decision-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle: activeDecision.title,
          context: activeDecision.context,
          category: activeDecision.category,
          options: activeDecision.options,
          pastEntries: entries.slice(0, 10),
          memories,
        }),
      });

      if (!res.ok) throw new Error('Decision intelligence simulation failed.');
      const data = await res.json();

      if (data.decision) {
        const updated: DecisionItem = {
          ...activeDecision,
          options: data.decision.options || activeDecision.options,
          historicalContext: data.decision.historicalContext,
          pressureTest: data.decision.pressureTest,
          updatedAt: Date.now(),
        };

        setActiveDecision(updated);
        if (updated.options.length > 0) {
          setSelectedOptionId(updated.options[0].id);
        }
        await onSaveDecision(updated);
      }
    } catch (err: any) {
      console.warn('Simulation failed:', err);
      setSimulationError(err?.message || 'Could not simulate future paths.');
    } finally {
      setIsSimulating(false);
    }
  };

  const currentOption = activeDecision.options.find((o) => o.id === selectedOptionId) || activeDecision.options[0];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-6xl mx-auto w-full pb-20">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-1.5">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Decision Intelligence & Future-Path Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Branching Paths & Pre-Mortem Testing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Model options across 1-month, 6-month, and 2-year horizons, grounded in your historical patterns and core values.
          </p>
        </div>

        {/* Saved Decisions Selector */}
        {decisions.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Saved:</span>
            <select
              value={activeDecision.id}
              onChange={(e) => {
                const found = decisions.find((d) => d.id === e.target.value);
                if (found) {
                  setActiveDecision(found);
                  if (found.options.length > 0) setSelectedOptionId(found.options[0].id);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-blue-500/40"
            >
              {decisions.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                  {d.title || 'Untitled Decision'}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const newDec: DecisionItem = {
                  id: `dec-${Date.now()}`,
                  userId,
                  title: '',
                  context: '',
                  category: 'career',
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  status: 'active',
                  options: [],
                };
                setActiveDecision(newDec);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer border border-white/15"
            >
              + New
            </button>
          </div>
        )}
      </div>

      {/* Decision Framing Input Card */}
      <section className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase text-slate-400 font-mono">Decision Dilemma:</label>
            <input
              type="text"
              placeholder="e.g. Accept corporate Staff Architect role vs. Build independent consultancy..."
              value={activeDecision.title}
              onChange={(e) => setActiveDecision({ ...activeDecision, title: e.target.value })}
              className="w-full px-4 py-2.5 text-sm sm:text-base font-semibold bg-white/[0.03] border border-white/10 rounded-xl focus:bg-white/[0.06] focus:border-blue-500/40 focus:outline-none text-white placeholder-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-slate-400 font-mono">Category:</label>
            <select
              value={activeDecision.category}
              onChange={(e) => setActiveDecision({ ...activeDecision, category: e.target.value as any })}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl focus:bg-white/[0.06] focus:border-blue-500/40 focus:outline-none text-white cursor-pointer"
            >
              <option value="career" className="bg-slate-900">Career & Vocation</option>
              <option value="personal" className="bg-slate-900">Personal Growth</option>
              <option value="relational" className="bg-slate-900">Relationships & Family</option>
              <option value="financial" className="bg-slate-900">Financial Commitment</option>
              <option value="creative" className="bg-slate-900">Creative Direction</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-slate-400 font-mono">Context & Nuance:</label>
          <textarea
            rows={3}
            placeholder="What is at stake? What are the main trade-offs, financial constraints, fears, or deadlines?"
            value={activeDecision.context}
            onChange={(e) => setActiveDecision({ ...activeDecision, context: e.target.value })}
            className="w-full p-3 text-xs sm:text-sm bg-white/[0.03] border border-white/10 rounded-xl focus:bg-white/[0.06] focus:border-blue-500/40 focus:outline-none text-slate-200 placeholder-slate-500 resize-y"
          />
        </div>

        {/* Action button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
          <span className="text-xs text-slate-400">
            Grounds simulations in your {entries.length} reflections and {memories.length} personal memory units.
          </span>

          <button
            id="simulate-decision-btn"
            onClick={handleSimulateDecision}
            disabled={isSimulating || !activeDecision.title.trim()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/35 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-lg backdrop-blur-md disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isSimulating ? 'animate-spin text-blue-400' : 'text-blue-400'}`} />
            <span>{isSimulating ? 'Simulating Branching Paths...' : 'Simulate Future Paths'}</span>
          </button>
        </div>
      </section>

      {/* HISTORICAL CONTEXT BANNER: "Something from your past may be relevant" */}
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

          {/* Expanded Historical Evidence Drawer */}
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

      {/* Main Options & Visualization Workspace */}
      {activeDecision.options && activeDecision.options.length > 0 && (
        <div className="space-y-5">
          {/* Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            {/* Options Tabs */}
            <div className="flex items-center space-x-2">
              {activeDecision.options.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    (selectedOptionId === opt.id || (!selectedOptionId && idx === 0))
                      ? 'bg-blue-500/20 border-blue-500/40 text-white shadow-md'
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
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeViewMode === 'branching' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Branching Map
              </button>
              <button
                onClick={() => setActiveViewMode('scorecards')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeViewMode === 'scorecards' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Scorecards
              </button>
              <button
                onClick={() => setActiveViewMode('comparison')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeViewMode === 'comparison' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Comparison Matrix
              </button>
              <button
                onClick={() => setActiveViewMode('pressureTest')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeViewMode === 'pressureTest' ? 'bg-rose-500/20 text-rose-200 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pressure Test
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: BRANCHING TIMELINE MAP */}
          {activeViewMode === 'branching' && currentOption && (
            <div className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">{currentOption.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{currentOption.description}</p>
              </div>

              {/* 3 Horizon Timeline Projections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>1 Month Horizon</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Immediate Impact</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{currentOption.timeline1Mo}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>6 Months Horizon</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Systemic Habit</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{currentOption.timeline6Mo}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
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
                <div className="space-y-3 pt-2">
                  <span className="text-xs uppercase font-semibold text-slate-400 font-mono">Branching Sub-Scenarios:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentOption.branches.map((br) => (
                      <div key={br.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{br.label}</span>
                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.2 rounded-full border ${
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
                        <p className="text-xs text-slate-300">{br.outcomeScenario}</p>
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
            <div className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl space-y-6">
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
            <div className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl space-y-4 overflow-x-auto">
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
            <div className="bg-rose-500/[0.03] backdrop-blur-xl rounded-2xl border border-rose-500/25 p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center space-x-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  Pre-Mortem Failure Stress-Test
                </h3>
              </div>

              {/* Pre-Mortem Scenario */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <span className="text-xs font-semibold text-rose-300 uppercase font-mono">
                  Simulated Failure Scenario (18 Months Out):
                </span>
                <p className="text-xs text-rose-100 leading-relaxed font-editorial italic text-sm">
                  "{activeDecision.pressureTest.preMortemFailureScenario}"
                </p>
              </div>

              {/* Blind Spot Warning */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <span className="text-xs font-semibold text-amber-300 uppercase font-mono">
                  Hidden Assumption / Blind Spot Warning:
                </span>
                <p className="text-xs text-amber-100 leading-relaxed">
                  {activeDecision.pressureTest.blindSpotWarning}
                </p>
              </div>

              {/* Proactive Mitigation Strategy */}
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
        </div>
      )}
    </div>
  );
};
