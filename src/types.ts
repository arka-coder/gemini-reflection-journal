export type MoodType = 'peaceful' | 'energized' | 'anxious' | 'reflective' | 'grateful' | 'neutral';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  body: string;
  mood: MoodType;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastSummary?: string;
  extractedMemoryCount?: number;
}

export type ReflectionMode = 'reflection' | 'summary' | 'brainstorm' | 'chat';

export interface Interaction {
  id: string;
  entryId: string;
  userId: string;
  role: 'user' | 'model';
  text: string;
  mode: ReflectionMode;
  modelUsed?: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ==========================================
// AI MIRROR & PERSONAL MEMORY ENGINE SCHEMAS
// ==========================================

export type MemoryCategory =
  | 'facts'
  | 'values'
  | 'goals'
  | 'preferences'
  | 'recurring_themes'
  | 'emotional_patterns'
  | 'decision_patterns'
  | 'strengths'
  | 'possible_blind_spots'
  | 'important_decisions'
  | 'contradictions'
  | 'unresolved_questions';

export type MemoryClassification = 'USER_FACT' | 'AI_INFERENCE' | 'SIMULATED_POSSIBILITY';

export interface MemoryItem {
  id: string;
  userId: string;
  type: MemoryCategory;
  content: string;
  classification: MemoryClassification;
  sourceEntryIds: string[];
  sourceDecisionIds?: string[];
  createdAt: number;
  lastSeenAt: number;
  confidence: number; // 0 - 100
  confidenceLevel: 'low' | 'medium' | 'high';
  evidenceCount: number;
  contextSnippet?: string;
}

export type PatternCategory =
  | 'repeated_theme'
  | 'recurring_emotion'
  | 'decision_behavior'
  | 'common_trigger'
  | 'avoidance'
  | 'perspective_shift'
  | 'uncertainty'
  | 'validation_seeking';

export interface Pattern {
  id: string;
  title: string;
  description: string;
  category: PatternCategory;
  confidence: number; // 0 - 100
  confidenceLevel: 'low' | 'medium' | 'high';
  sourceEntryIds: string[];
  firstObserved: number;
  lastObserved: number;
  trend: 'increasing' | 'stable' | 'evolving' | 'subsiding';
  impactArea: string;
}

export interface Theme {
  id: string;
  label: string;
  mentionsCount: number;
  sentimentTone: string;
  connectedThemeIds: string[];
}

export type TensionType =
  | 'value_vs_behavior'
  | 'goal_vs_goal'
  | 'conflicting_preferences'
  | 'changing_perspective'
  | 'intention_without_action'
  | 'independence_vs_reassurance'
  | 'certainty_vs_risk';

export interface Contradiction {
  id: string;
  title: string;
  tensionType: TensionType;
  statementA: string;
  sourceA: { id: string; date: number; title: string; excerpt: string };
  statementB: string;
  sourceB: { id: string; date: number; title: string; excerpt: string };
  insight: string;
  confidence: number;
}

export interface HistoricalConnection {
  entryId: string;
  entryTitle: string;
  date: number;
  similarityScore: number;
  relevantExcerpt: string;
  relationType: string;
}

export interface FutureTrajectory {
  id: string;
  currentPattern: string;
  possibleTrajectory: string;
  whyAiThinksThis: string;
  evidence: string[];
  sourceEntryIds: string[];
  pivotVariable: string;
  classification: 'SIMULATED_POSSIBILITY';
  timeframe: string;
}

export type LifeGraphNodeType = 'theme' | 'goal' | 'value' | 'emotion' | 'decision_pattern';

export interface LifeGraphNode {
  id: string;
  label: string;
  type: LifeGraphNodeType;
  mentions: number;
  confidence: number;
  supportingEntryIds: string[];
  commonTriggers: string[];
  associatedEmotions: string[];
  timeline: { date: number; note: string }[];
  x?: number;
  y?: number;
}

export interface LifeGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  strength: number; // 1 to 5
  evidenceCount: number;
}

export interface MirrorInsight {
  headline: string;
  observation: string;
  confidenceScore: number;
  groundedQuotes: string[];
  strengths: { title: string; description: string; evidence: string }[];
  possibleBlindSpots: { title: string; observation: string; suggestion: string; evidence: string }[];
  emotionalTrends: { emotion: string; trajectory: 'rising' | 'steady' | 'easing'; note: string }[];
  changesOverTime: { period: string; shift: string; evidence: string }[];
  lastUpdated: number;
}

export interface PastSelfQueryResponse {
  query: string;
  hasSufficientEvidence: boolean;
  synthesis: string;
  whatChanged: string;
  whatStayedTheSame: string;
  relevantEntries: {
    id: string;
    title: string;
    date: number;
    relevance: number;
    excerpt: string;
  }[];
  suggestedFollowUp?: string;
}

// ==========================================
// DECISION INTELLIGENCE & FUTURE PATH SCHEMAS
// ==========================================

export interface DecisionBranchNode {
  id: string;
  label: string;
  stage: 'immediate' | '1_month' | '6_months' | '2_years';
  outcomeScenario: string;
  riskProbability: 'low' | 'medium' | 'high';
  emotionalPayoff: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  timeline1Mo: string;
  timeline6Mo: string;
  timeline2Yr: string;
  scorecard: {
    riskScore: number; // 1 - 10
    fulfillmentScore: number; // 1 - 10
    reversibilityScore: number; // 1 - 10
    valuesAlignmentScore: number; // 1 - 10
  };
  pros: string[];
  cons: string[];
  branches: DecisionBranchNode[];
}

export interface DecisionItem {
  id: string;
  userId: string;
  title: string;
  context: string;
  category: 'career' | 'personal' | 'relational' | 'financial' | 'creative';
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'evaluating' | 'decided' | 'archived';
  chosenOptionId?: string;
  options: DecisionOption[];
  historicalContext?: {
    relevantPreviousDecisions: string[];
    recurringValues: string[];
    relevantPatterns: string[];
    unresolvedTensions: string[];
    advisoryNote: string;
  };
  pressureTest?: {
    preMortemFailureScenario: string;
    blindSpotWarning: string;
    stressFactors: string[];
    mitigationStrategy: string;
  };
}

export interface YouSaidThisBeforeItem {
  id: string;
  currentExcerpt: string;
  currentDate: number;
  currentEntryId?: string;
  historicalExcerpt: string;
  historicalDate: number;
  historicalEntryId: string;
  historicalEntryTitle: string;
  whatChanged: string;
  whatStayedTheSame: string;
  commonTheme: string;
  confidence: number; // 0 - 100
}

export interface ExplainabilityEvidenceItem {
  id: string;
  date: number;
  title: string;
  type: 'reflection' | 'decision';
  snippet?: string;
}

export interface ExplainabilityData {
  title: string;
  commonTheme: string;
  evidenceCount: number;
  confidence: number;
  evidence: ExplainabilityEvidenceItem[];
  notEnoughEvidence?: boolean;
  notes?: string;
}

export type NavTab = 'journal' | 'mirror' | 'decide' | 'future';
export type ActiveNavTab = 'journal' | 'mirror' | 'decide' | 'future';
