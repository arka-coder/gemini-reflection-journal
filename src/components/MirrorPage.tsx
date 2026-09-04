import React, { useState, useEffect } from 'react';
import {
  MirrorInsight,
  Pattern,
  Theme,
  Contradiction,
  LifeGraphNode,
  LifeGraphEdge,
  FutureTrajectory,
  JournalEntry,
  MemoryItem,
  DecisionItem,
} from '../types';
import { LifeGraph } from './LifeGraph';
import { AskPastSelf } from './AskPastSelf';
import { FutureMe } from './FutureMe';
import {
  Sparkles,
  RefreshCw,
  Brain,
  Shield,
  Eye,
  AlertTriangle,
  TrendingUp,
  Clock,
  Quote,
  CheckCircle2,
  ChevronRight,
  Database,
  ArrowRight,
  Flame,
  Scale,
  Compass,
  FileText,
} from 'lucide-react';

interface MirrorPageProps {
  userId: string;
  entries: JournalEntry[];
  memories: MemoryItem[];
  decisions: DecisionItem[];
  onNavigateToDecide?: (contextFromMirror?: any) => void;
  onNavigateToReflect?: () => void;
  onSeedDemoData?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  repeated_theme: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
  recurring_emotion: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  decision_behavior: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  common_trigger: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
  avoidance: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
  perspective_shift: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  uncertainty: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
  validation_seeking: 'text-pink-300 bg-pink-500/10 border-pink-500/20',
};

export const MirrorPage: React.FC<MirrorPageProps> = ({
  userId,
  entries,
  memories,
  decisions,
  onNavigateToDecide,
  onNavigateToReflect,
  onSeedDemoData,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core state
  const [insight, setInsight] = useState<MirrorInsight | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [graphNodes, setGraphNodes] = useState<LifeGraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<LifeGraphEdge[]>([]);
  const [trajectories, setTrajectories] = useState<FutureTrajectory[]>([]);

  // Modals / detailed view
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  const triggerMirrorSynthesis = async () => {
    setIsSynthesizing(true);
    setError(null);

    try {
      // 1. Run Mirror Analysis API
      const analysisRes = await fetch('/api/gemini/mirror-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, memories }),
      });

      if (!analysisRes.ok) {
        throw new Error('Failed to complete AI Mirror synthesis.');
      }

      const analysisData = await analysisRes.json();
      if (analysisData.insight) setInsight(analysisData.insight);
      if (analysisData.patterns) setPatterns(analysisData.patterns);
      if (analysisData.contradictions) setContradictions(analysisData.contradictions);
      if (analysisData.graphNodes) setGraphNodes(analysisData.graphNodes);
      if (analysisData.graphEdges) setGraphEdges(analysisData.graphEdges);

      // 2. Fetch Future Me Trajectories
      const futureRes = await fetch('/api/gemini/future-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patterns: analysisData.patterns || patterns,
          recentEntries: entries.slice(0, 5),
          memories,
        }),
      });

      if (futureRes.ok) {
        const futureData = await futureRes.json();
        if (Array.isArray(futureData.trajectories)) {
          setTrajectories(futureData.trajectories);
        }
      }
    } catch (err: any) {
      console.warn('Synthesis encountered issue, checking cached or local data:', err);
      setError(err?.message || 'Could not reach analysis endpoint. Using local state.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (entries.length > 0) {
      triggerMirrorSynthesis();
    }
  }, [entries.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8 max-w-6xl mx-auto w-full pb-20">
      {/* Top Mirror Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Brain className="w-3.5 h-3.5" />
            <span>AI Mirror • Longitudinal Self-Reflection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            How You Think, Over Time
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            A private analytical mirror synthesizing your entries, unearthing recurring behavioral patterns, tensions, and projected trajectories.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onSeedDemoData && entries.length <= 1 && (
            <button
              onClick={onSeedDemoData}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 text-xs font-medium transition cursor-pointer shadow-sm"
              title="Populate realistic 4-month sample mindspace to test all capabilities"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Load Rich Demo Mindspace</span>
            </button>
          )}

          <button
            id="synthesize-mirror-btn"
            onClick={triggerMirrorSynthesis}
            disabled={isSynthesizing}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/35 text-white text-xs font-semibold transition cursor-pointer shadow-lg backdrop-blur-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing...' : 'Re-Analyze Mindspace'}</span>
          </button>
        </div>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={triggerMirrorSynthesis}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State Prompt if 0 entries */}
      {entries.length === 0 && (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Reflective Mirror is Waiting for Your First Words</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Write your first journal reflection or explore the pre-loaded demo mindspace to see the AI Mirror analyze patterns, tensions, and life vectors.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {onNavigateToReflect && (
              <button
                onClick={onNavigateToReflect}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-xs font-medium cursor-pointer"
              >
                Write an Entry
              </button>
            )}
            {onSeedDemoData && (
              <button
                onClick={onSeedDemoData}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 text-xs font-medium cursor-pointer"
              >
                Explore Sample Mindspace
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. "WHAT I'VE NOTICED" AI INSIGHT CARD */}
      {insight && (
        <section className="relative rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.015] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none" />

          {/* Card Top Pill & Confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>What I've Noticed Across Your Reflections</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <span>Confidence:</span>
              <span className="font-bold text-emerald-400">{insight.confidenceScore || 90}%</span>
            </div>
          </div>

          {/* Overarching Headline */}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {insight.headline}
          </h2>

          {/* Deep Observational Text */}
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200 font-editorial space-y-3 whitespace-pre-line text-base">
            {insight.observation}
          </div>

          {/* Grounded Quotes Pills */}
          {insight.groundedQuotes && insight.groundedQuotes.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-xs uppercase font-mono font-semibold text-slate-400 flex items-center space-x-1.5">
                <Quote className="w-3.5 h-3.5 text-slate-400" />
                <span>Grounded Citations From Your Writing:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {insight.groundedQuotes.map((quote, idx) => (
                  <div
                    key={idx}
                    className="text-xs italic text-slate-300 bg-white/[0.03] border border-white/10 p-3 rounded-xl border-l-2 border-l-emerald-400"
                  >
                    "{quote}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 2. STRENGTHS & POSSIBLE BLIND SPOTS (2 COLUMNS) */}
      {insight && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <section className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10 text-emerald-400">
              <Shield className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Observed Strengths</h3>
            </div>

            <div className="space-y-3">
              {insight.strengths?.map((str, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 hover:border-white/15 transition">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{str.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{str.description}</p>
                  {str.evidence && (
                    <p className="text-[11px] text-slate-500 font-mono pt-1">
                      Evidence: {str.evidence}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Possible Blind Spots (Careful Non-Clinical Framing) */}
          <section className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10 text-amber-400">
              <Eye className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Possible Blind Spots</h3>
            </div>

            <div className="space-y-3">
              {insight.possibleBlindSpots?.map((spot, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/15 transition">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{spot.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{spot.observation}</p>
                  {spot.suggestion && (
                    <div className="p-2.5 rounded-lg bg-amber-500/[0.05] border border-amber-500/20 text-[11px] text-amber-200">
                      <strong>Constructive Reframe:</strong> {spot.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 3. CURRENT PATTERNS & RECURRING THEMES */}
      {patterns.length > 0 && (
        <section className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-slate-300" />
              <h3 className="text-base font-bold text-white tracking-tight">Current Patterns & Behavioral Dynamics</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{patterns.length} patterns discovered</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patterns.map((pat) => {
              const colorClass = CATEGORY_COLORS[pat.category] || 'text-slate-300 bg-white/5 border-white/10';
              return (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPattern(pat)}
                  className="rounded-xl bg-white/[0.02] border border-white/10 p-4 space-y-3 hover:border-white/20 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${colorClass}`}>
                      {pat.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {pat.confidence}% confidence
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition">
                      {pat.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                      {pat.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-500">
                    <span className="capitalize">Trend: {pat.trend || 'stable'}</span>
                    <span className="text-emerald-400 group-hover:translate-x-0.5 transition flex items-center">
                      Inspect evidence <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. CONTRADICTIONS & TENSIONS DETECTOR */}
      {contradictions.length > 0 && (
        <section className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Contradictions & Unresolved Tensions</h3>
            </div>
            <span className="text-xs font-mono text-amber-400">{contradictions.length} tensions surfaced</span>
          </div>

          <div className="space-y-4">
            {contradictions.map((con) => (
              <div
                key={con.id}
                className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4 hover:border-amber-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase font-mono">
                    {con.tensionType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{con.confidence}% certainty</span>
                </div>

                <h4 className="text-sm font-bold text-white">{con.title}</h4>

                {/* Statement A vs Statement B Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">Perspective A:</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{con.statementA}</p>
                    {con.sourceA?.excerpt && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                        "{con.sourceA.excerpt}"
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">Perspective B (Competing Vector):</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{con.statementB}</p>
                    {con.sourceB?.excerpt && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                        "{con.sourceB.excerpt}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Mirror Insight / Resolution Reframe */}
                <div className="p-3.5 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl text-xs text-amber-200 flex items-start space-x-2">
                  <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Reflective Insight:</strong> {con.insight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. INTERACTIVE LIFE GRAPH */}
      {graphNodes.length > 0 && (
        <LifeGraph nodes={graphNodes} edges={graphEdges} />
      )}

      {/* 6. "ASK YOUR PAST SELF" TOOL */}
      <AskPastSelf entries={entries} memories={memories} />

      {/* 7. "FUTURE ME" TRAJECTORIES */}
      {trajectories.length > 0 && (
        <FutureMe
          trajectories={trajectories}
          patterns={patterns}
          onExploreInDecisionMode={(traj) => {
            if (onNavigateToDecide) {
              onNavigateToDecide({
                title: `Trajectory Exploration: ${traj.currentPattern}`,
                context: `Investigating the trajectory: "${traj.possibleTrajectory}". Pivot variable to test: ${traj.pivotVariable}`,
                category: 'career',
              });
            }
          }}
          onRefresh={triggerMirrorSynthesis}
          isLoading={isSynthesizing}
        />
      )}

      {/* 8. RECENT EMOTIONAL TRENDS & IMPORTANT CHANGES OVER TIME */}
      {insight?.emotionalTrends && (
        <section className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-300" />
              <span>Emotional Vectors & Historical Shifts</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {insight.emotionalTrends.map((trend, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{trend.emotion}</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.2 rounded-full border ${
                      trend.trajectory === 'rising'
                        ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                        : trend.trajectory === 'easing'
                        ? 'text-blue-300 bg-blue-500/10 border-blue-500/20'
                        : 'text-slate-300 bg-white/5 border-white/10'
                    }`}
                  >
                    {trend.trajectory}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{trend.note}</p>
              </div>
            ))}
          </div>

          {/* Changes over time */}
          {insight.changesOverTime && insight.changesOverTime.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-xs font-semibold text-slate-400 font-mono uppercase">Key Milestones & Mindset Shifts:</span>
              <div className="space-y-2">
                {insight.changesOverTime.map((shift, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.015] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-emerald-300 min-w-[140px]">{shift.period}</span>
                    <span className="text-slate-300 flex-1">{shift.shift}</span>
                    <span className="text-[11px] text-slate-500 font-mono italic">({shift.evidence})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {selectedPattern.category.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{selectedPattern.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPattern(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{selectedPattern.description}</p>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Confidence:</span>
                <span className="text-emerald-400 font-bold">{selectedPattern.confidence}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Trend:</span>
                <span className="capitalize text-white">{selectedPattern.trend}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Impact Area:</span>
                <span className="text-white">{selectedPattern.impactArea}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPattern(null)}
              className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close Detail
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
