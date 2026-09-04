import { JournalEntry, MemoryItem, DecisionItem, Pattern, Contradiction, LifeGraphNode, LifeGraphEdge, MirrorInsight, FutureTrajectory } from '../types';

export const DEMO_ENTRIES: Omit<JournalEntry, 'userId'>[] = [
  {
    id: 'demo-entry-1',
    title: 'The Tension Between Speed and Direction',
    mood: 'reflective',
    tags: ['career', 'focus', 'values'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120, // 120 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
    body: `I noticed this morning that I often confuse velocity with vector. When I answer 40 emails and check off 15 minor tasks, my nervous system feels an artificial high of productivity. But when I step back, I realize none of those tasks move the needle on my core creative project or long-term vision.

I told myself I value autonomy and deep work, yet I keep filling my calendar with reactive commitments because saying 'no' creates acute social discomfort. I need to get comfortable with the temporary tension of declining meetings so I can protect 3 hours of uninterrupted focus every morning.`,
  },
  {
    id: 'demo-entry-2',
    title: 'Evaluating the Staff Architect Offer',
    mood: 'anxious',
    tags: ['career', 'decision', 'money'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90, // 90 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    body: `Received the formal offer for the Staff Architect role at the enterprise software firm. The compensation package is 40% higher than my current baseline. 

On paper, taking it seems like the obvious logical move. But my gut feels heavy. In the interviews, the VP emphasized consensus-driven steering committees and long approval chains. In my journal three months ago, I wrote that my primary value is creative autonomy and high agency. If I take this, will I spend 80% of my week defending slide decks instead of building real architecture? I fear golden handcuffs.`,
  },
  {
    id: 'demo-entry-3',
    title: 'Post-Decision Reflection: Declining the Corporate Track',
    mood: 'peaceful',
    tags: ['decision', 'autonomy', 'growth'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 75, // 75 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 75,
    body: `I sent the polite decline email for the Staff Architect position today. For the first two hours, my chest was tight with doubt—'Did I just throw away financial safety?' 

By afternoon, a quiet wave of relief washed over me. I committed that instead of trading agency for corporate status, I will invest the next 6 months into launching our independent consultancy and building open-source developer tooling. The runway is tighter, but my work aligns with who I want to be in 10 years.`,
  },
  {
    id: 'demo-entry-4',
    title: 'The Reluctance to Delegate and Fear of Imperfection',
    mood: 'anxious',
    tags: ['leadership', 'avoidance', 'overthinking'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35, // 35 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    body: `It happened again this week. We brought on two junior contributors to help scale our pipeline, but I ended up rewriting their pull requests after midnight rather than coaching them through revisions. 

Why do I do this? It's not because their code was broken; it's because my standard of perfection makes handoffs feel physically uncomfortable. By avoiding the friction of delegation, I become the bottleneck I complain about. If I don't learn to tolerate small variances in style, I will burn out before Q4.`,
  },
  {
    id: 'demo-entry-5',
    title: 'Reclaiming Presence and Finding Flow',
    mood: 'grateful',
    tags: ['wellbeing', 'values', 'clarity'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    body: `Took a full digital Sabbath yesterday—no laptop, phone in airplane mode in a drawer. Walked through the redwood park for two hours without podcasts or noise. 

When you strip away external validation and algorithmic urgency, what remains is surprising: I actually love the craft itself. I don't need external accolades to validate the work. Moving forward, I want to anchor my week around craft and human connection rather than vanity metrics.`,
  },
];

export const DEMO_MEMORIES: Omit<MemoryItem, 'userId'>[] = [
  {
    id: 'mem-fact-1',
    type: 'facts',
    content: 'Works as a senior software architect and independent technology consultant.',
    classification: 'USER_FACT',
    sourceEntryIds: ['demo-entry-2', 'demo-entry-3'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    lastSeenAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    confidence: 98,
    confidenceLevel: 'high',
    evidenceCount: 3,
    contextSnippet: 'Declined enterprise Staff Architect offer to build independent consultancy.',
  },
  {
    id: 'mem-value-1',
    type: 'values',
    content: 'Deep personal sovereignty and creative agency take precedence over corporate prestige or bureaucracy.',
    classification: 'AI_INFERENCE',
    sourceEntryIds: ['demo-entry-1', 'demo-entry-2', 'demo-entry-3'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    lastSeenAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    confidence: 94,
    confidenceLevel: 'high',
    evidenceCount: 4,
    contextSnippet: 'Preferred tighter financial runway over consensus-driven steering committees.',
  },
  {
    id: 'mem-blindspot-1',
    type: 'possible_blind_spots',
    content: 'Prone to perfectionistic bottlenecking: Rewrites others’ contributions rather than tolerating coaching friction.',
    classification: 'AI_INFERENCE',
    sourceEntryIds: ['demo-entry-4'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    lastSeenAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    confidence: 88,
    confidenceLevel: 'high',
    evidenceCount: 2,
    contextSnippet: 'Rewriting pull requests after midnight instead of guiding junior team members.',
  },
  {
    id: 'mem-pattern-1',
    type: 'decision_patterns',
    content: 'Experiences acute short-term anxiety after making high-agency decisions, followed by profound calm and validation.',
    classification: 'AI_INFERENCE',
    sourceEntryIds: ['demo-entry-2', 'demo-entry-3'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 75,
    lastSeenAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    confidence: 91,
    confidenceLevel: 'high',
    evidenceCount: 3,
    contextSnippet: 'Tight chest for 2 hours after decline, followed by deep relief and renewed momentum.',
  },
  {
    id: 'mem-contradiction-1',
    type: 'contradictions',
    content: 'Publicly desires scale and delegation, but internally resists letting go of direct micro-execution control.',
    classification: 'AI_INFERENCE',
    sourceEntryIds: ['demo-entry-1', 'demo-entry-4'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    lastSeenAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    confidence: 86,
    confidenceLevel: 'medium',
    evidenceCount: 2,
    contextSnippet: 'Brought on junior contributors but rewrote their work to preserve personal style standards.',
  },
];

export const DEMO_MIRROR_INSIGHT: MirrorInsight = {
  headline: 'The Autonomy Vector: High Creative Agency vs. Operational Bottlenecking',
  observation: `Across four months of reflections, a decisive signature emerges: you possess an unusually clear internal compass regarding autonomy. When faced with high-status external validation (such as lucrative corporate roles), you consistently prioritize sovereignty, craftsmanship, and long-term agency over short-term prestige.

However, your primary operational tension is the mirror image of your high standards: perfectionism. Because you value excellence so deeply, delegating feels like a risk to your standards, causing you to secretly absorb team workloads and bottleneck your own expansion. Your greatest growth vector is learning to view mentorship not as an erosion of control, but as an extension of craftsmanship.`,
  confidenceScore: 92,
  groundedQuotes: [
    'I often confuse velocity with vector.',
    'I told myself I value autonomy... yet saying no creates acute social discomfort.',
    'I fear golden handcuffs.',
    'By avoiding the friction of delegation, I become the bottleneck I complain about.',
  ],
  strengths: [
    {
      title: 'Values-Aligned Courage',
      description: 'Willingness to reject lucrative compromises when they conflict with fundamental creative agency.',
      evidence: 'Declined the Staff Architect role despite a 40% compensation premium.',
    },
    {
      title: 'Rapid Metacognition',
      description: 'Ability to quickly identify when artificial urgency or vanity metrics are substituting for genuine purpose.',
      evidence: 'Recognized that checking off 15 minor tasks was an avoidance mechanism for creative work.',
    },
    {
      title: 'Grounding Rhythms',
      description: 'Active maintenance of restorative rituals like digital Sabbaths to reset emotional equilibrium.',
      evidence: 'Dedicated disconnection days with nature walks in redwoods to restore craft focus.',
    },
  ],
  possibleBlindSpots: [
    {
      title: 'Perfectionist Hoarding',
      observation: 'You may unconsciously equate delegation with loss of quality, leading you to rewrite others’ work.',
      suggestion: 'Set a 80/20 threshold: If a team member’s execution reaches 85% of your standard, approve it without tweaking.',
      evidence: 'Midnight pull request rewrites noted in entry from 35 days ago.',
    },
    {
      title: 'Pleasing vs. Boundary Friction',
      observation: 'A lingering discomfort with saying an immediate "no" to reactive requests fills calendar slots.',
      suggestion: 'Implement a 24-hour buffer before accepting any new external meetings or commitments.',
      evidence: 'Noted that saying no creates acute social discomfort despite wanting deep work.',
    },
  ],
  emotionalTrends: [
    { emotion: 'Autonomy & Agency', trajectory: 'rising', note: 'Strengthening commitment to independent paths.' },
    { emotion: 'Performance Anxiety', trajectory: 'easing', note: 'Shifting away from vanity metrics toward craft presence.' },
    { emotion: 'Operational Overload', trajectory: 'steady', note: 'Tied directly to delegation resistance.' },
  ],
  changesOverTime: [
    {
      period: '4 Months Ago',
      shift: 'Overwhelmed by reactive busyness and external validation traps.',
      evidence: 'Reported answering 40 emails without touching core creative projects.',
    },
    {
      period: '2-3 Months Ago',
      shift: 'Pivoted away from corporate safety net toward independent agency.',
      evidence: 'Explicitly turned down Staff Architect offer to build independent consultancy.',
    },
    {
      period: 'Past Month',
      shift: 'Confronting leadership growing pains and the necessity of delegation.',
      evidence: 'Identified personal perfectionism as the true bottleneck to team scale.',
    },
  ],
  lastUpdated: Date.now(),
};

export const DEMO_PATTERNS: Pattern[] = [
  {
    id: 'pat-1',
    title: 'The Velocity vs. Vector Trap',
    description: 'A recurring tendency to substitute shallow reactive task completion for ambiguous deep-work execution.',
    category: 'avoidance',
    confidence: 89,
    confidenceLevel: 'high',
    sourceEntryIds: ['demo-entry-1'],
    firstObserved: Date.now() - 1000 * 60 * 60 * 24 * 120,
    lastObserved: Date.now() - 1000 * 60 * 60 * 24 * 35,
    trend: 'subsiding',
    impactArea: 'Time Allocation & Creative Focus',
  },
  {
    id: 'pat-2',
    title: 'Post-Decisional Shockwave',
    description: 'Initial acute remorse and chest tightness after bold leaps, settling into lasting peace within 24 hours.',
    category: 'decision_behavior',
    confidence: 93,
    confidenceLevel: 'high',
    sourceEntryIds: ['demo-entry-2', 'demo-entry-3'],
    firstObserved: Date.now() - 1000 * 60 * 60 * 24 * 90,
    lastObserved: Date.now() - 1000 * 60 * 60 * 24 * 75,
    trend: 'stable',
    impactArea: 'Emotional Resilience During Change',
  },
  {
    id: 'pat-3',
    title: 'Delegation Friction as Perfectionism',
    description: 'Absorbing secondary workloads to avoid the temporary emotional discomfort of coaching and mentoring.',
    category: 'common_trigger',
    confidence: 87,
    confidenceLevel: 'high',
    sourceEntryIds: ['demo-entry-4'],
    firstObserved: Date.now() - 1000 * 60 * 60 * 24 * 35,
    lastObserved: Date.now() - 1000 * 60 * 60 * 24 * 8,
    trend: 'increasing',
    impactArea: 'Leadership & Scalability',
  },
  {
    id: 'pat-4',
    title: 'Sovereignty Over Prestige',
    description: 'Repeated prioritization of creative control and agency over higher financial compensation or titles.',
    category: 'repeated_theme',
    confidence: 96,
    confidenceLevel: 'high',
    sourceEntryIds: ['demo-entry-2', 'demo-entry-3', 'demo-entry-5'],
    firstObserved: Date.now() - 1000 * 60 * 60 * 24 * 90,
    lastObserved: Date.now() - 1000 * 60 * 60 * 24 * 8,
    trend: 'increasing',
    impactArea: 'Career & Life Architecture',
  },
];

export const DEMO_CONTRADICTIONS: Contradiction[] = [
  {
    id: 'con-1',
    title: 'Autonomy Desire vs. Delegation Resistance',
    tensionType: 'value_vs_behavior',
    statementA: 'Values personal freedom, sustainable hours, and scaling an independent organization.',
    sourceA: {
      id: 'demo-entry-3',
      date: Date.now() - 1000 * 60 * 60 * 24 * 75,
      title: 'Declining the Corporate Track',
      excerpt: 'I committed that instead of trading agency for corporate status, I will invest into launching our consultancy.',
    },
    statementB: 'Works midnight shifts rewriting junior code because delegating feels like compromising standards.',
    sourceB: {
      id: 'demo-entry-4',
      date: Date.now() - 1000 * 60 * 60 * 24 * 35,
      title: 'The Reluctance to Delegate',
      excerpt: 'I ended up rewriting their pull requests after midnight rather than coaching them through revisions.',
    },
    insight: 'Tension detected between the desire for organizational scale and the emotional tolerance for delegation friction.',
    confidence: 91,
  },
  {
    id: 'con-2',
    title: 'Social Agreeableness vs. Focus Protection',
    tensionType: 'intention_without_action',
    statementA: 'Requires 3 hours of quiet morning focus for high-leverage architectural and creative work.',
    sourceA: {
      id: 'demo-entry-1',
      date: Date.now() - 1000 * 60 * 60 * 24 * 120,
      title: 'The Tension Between Speed and Direction',
      excerpt: 'I need to protect 3 hours of uninterrupted focus every morning.',
    },
    statementB: 'Accepts meetings and answers immediate emails because saying no causes acute social discomfort.',
    sourceB: {
      id: 'demo-entry-1',
      date: Date.now() - 1000 * 60 * 60 * 24 * 120,
      title: 'The Tension Between Speed and Direction',
      excerpt: 'I keep filling my calendar with reactive commitments because saying no creates acute social discomfort.',
    },
    insight: 'Two priorities appear to compete for energy: preserving social harmony vs. defending sovereign work boundaries.',
    confidence: 88,
  },
];

export const DEMO_LIFE_GRAPH_NODES: LifeGraphNode[] = [
  {
    id: 'node-autonomy',
    label: 'Creative Autonomy',
    type: 'value',
    mentions: 8,
    confidence: 96,
    supportingEntryIds: ['demo-entry-1', 'demo-entry-2', 'demo-entry-3'],
    commonTriggers: ['Bureaucracy', 'Long approval chains', 'Golden handcuffs'],
    associatedEmotions: ['Liberation', 'Clarity', 'Fierce independence'],
    timeline: [
      { date: Date.now() - 1000 * 60 * 60 * 24 * 90, note: 'Refused corporate offer to protect agency' },
      { date: Date.now() - 1000 * 60 * 60 * 24 * 75, note: 'Formally launched independent practice' },
    ],
    x: 200,
    y: 120,
  },
  {
    id: 'node-perfectionism',
    label: 'Perfectionism & Bottlenecking',
    type: 'decision_pattern',
    mentions: 5,
    confidence: 88,
    supportingEntryIds: ['demo-entry-4'],
    commonTriggers: ['Code reviews', 'Junior handoffs', 'Approaching deadlines'],
    associatedEmotions: ['Anxiety', 'Impatience', 'Over-responsibility'],
    timeline: [
      { date: Date.now() - 1000 * 60 * 60 * 24 * 35, note: 'Rewrote team PRs overnight' },
    ],
    x: 480,
    y: 130,
  },
  {
    id: 'node-craft',
    label: 'Deep Craftsmanship',
    type: 'theme',
    mentions: 7,
    confidence: 94,
    supportingEntryIds: ['demo-entry-1', 'demo-entry-5'],
    commonTriggers: ['Uninterrupted mornings', 'Offline walk', 'Clean system architecture'],
    associatedEmotions: ['Flow', 'Peace', 'Satisfaction'],
    timeline: [
      { date: Date.now() - 1000 * 60 * 60 * 24 * 8, note: 'Digital Sabbath redwoods walk' },
    ],
    x: 230,
    y: 310,
  },
  {
    id: 'node-velocity-trap',
    label: 'Reactive Urgency',
    type: 'emotion',
    mentions: 6,
    confidence: 85,
    supportingEntryIds: ['demo-entry-1'],
    commonTriggers: ['Email notifications', 'Calendar clutter', 'Social expectations'],
    associatedEmotions: ['Fake productivity', 'Subtle dread', 'Scattered attention'],
    timeline: [
      { date: Date.now() - 1000 * 60 * 60 * 24 * 120, note: 'Discovered velocity vs vector illusion' },
    ],
    x: 520,
    y: 320,
  },
  {
    id: 'node-scale',
    label: 'Independent Consultancy',
    type: 'goal',
    mentions: 6,
    confidence: 92,
    supportingEntryIds: ['demo-entry-3', 'demo-entry-4'],
    commonTriggers: ['Client wins', 'Open source releases'],
    associatedEmotions: ['Excitement', 'Financial accountability'],
    timeline: [
      { date: Date.now() - 1000 * 60 * 60 * 24 * 75, note: 'Committed 6-month runway to venture' },
    ],
    x: 360,
    y: 220,
  },
];

export const DEMO_LIFE_GRAPH_EDGES: LifeGraphEdge[] = [
  { id: 'edge-1', source: 'node-autonomy', target: 'node-scale', relation: 'drives', strength: 5, evidenceCount: 3 },
  { id: 'edge-2', source: 'node-scale', target: 'node-perfectionism', relation: 'triggers friction in', strength: 4, evidenceCount: 2 },
  { id: 'edge-3', source: 'node-perfectionism', target: 'node-velocity-trap', relation: 'reinforces', strength: 4, evidenceCount: 2 },
  { id: 'edge-4', source: 'node-autonomy', target: 'node-craft', relation: 'nurtures', strength: 5, evidenceCount: 4 },
  { id: 'edge-5', source: 'node-craft', target: 'node-velocity-trap', relation: 'counteracts', strength: 4, evidenceCount: 3 },
];

export const DEMO_FUTURE_TRAJECTORIES: FutureTrajectory[] = [
  {
    id: 'traj-1',
    currentPattern: 'Perfectionist bottlenecking while attempting to expand consultancy capacity.',
    possibleTrajectory: 'Within 6 months, operational fatigue sets in. You become frustrated with team performance while team members feel disempowered, risking client delivery delays.',
    whyAiThinksThis: 'You noted rewriting junior code overnight rather than mentoring, absorbing 100% of review friction.',
    evidence: [
      'Rewriting PRs after midnight',
      'Confusing delegation with quality loss',
      'Hesitation to let others make safe-to-fail mistakes',
    ],
    sourceEntryIds: ['demo-entry-4'],
    pivotVariable: 'Establishing a strict "85% rule" and weekly pair-programming feedback sessions instead of silent solo rewrites.',
    classification: 'SIMULATED_POSSIBILITY',
    timeframe: '6 months',
  },
  {
    id: 'traj-2',
    currentPattern: 'Sovereignty-first prioritization of craftsmanship and digital disconnection.',
    possibleTrajectory: 'A sustainable high-margin studio practice emerges, producing respected open-source tools with zero corporate bloat and deep personal satisfaction.',
    whyAiThinksThis: 'Demonstrated ability to turn down high financial bribes (Staff Architect) in exchange for deep creative alignment.',
    evidence: [
      'Declined enterprise offer for agency',
      'Instituted weekly digital Sabbaths',
      'Clear articulation of vector over velocity',
    ],
    sourceEntryIds: ['demo-entry-3', 'demo-entry-5'],
    pivotVariable: 'Maintaining strict boundaries against low-leverage consulting retainers that masquerade as security.',
    classification: 'SIMULATED_POSSIBILITY',
    timeframe: '1-2 years',
  },
];

export const DEMO_DECISION: DecisionItem = {
  id: 'demo-dec-1',
  userId: 'demo-user',
  title: 'Consultancy Retainer vs. Full-Time Open-Source Tool Development',
  context: 'A fintech client wants a guaranteed 20 hrs/week retainer at $180/hr for 6 months. It provides stable income, but directly threatens the release timeline of my open-source developer framework.',
  category: 'career',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  status: 'evaluating',
  options: [
    {
      id: 'opt-retainer',
      title: 'Option A: Accept 20h/wk Retainer',
      description: 'Lock in guaranteed $15k/month cashflow to fund savings while building tool in remaining time.',
      timeline1Mo: 'Immediate financial calm, but schedule fragmented by client standups and emergency pings.',
      timeline6Mo: 'High bank balance, but open-source tool is 5 months behind schedule; client demands expand.',
      timeline2Yr: 'Gradual transition back into full-time consulting agency; personal software vision shelved.',
      scorecard: {
        riskScore: 3,
        fulfillmentScore: 5,
        reversibilityScore: 7,
        valuesAlignmentScore: 4,
      },
      pros: ['Guaranteed financial security', 'Zero burn on personal savings', 'Low existential anxiety'],
      cons: ['High context switching', 'Threatens core value of sovereign focus', 'Client creep'],
      branches: [
        {
          id: 'b-ret-1',
          label: 'Immediate Horizon',
          stage: '1_month',
          outcomeScenario: 'Calm bank balance, but mornings consumed by Slack messages.',
          riskProbability: 'low',
          emotionalPayoff: 'Relief from financial worry',
        },
        {
          id: 'b-ret-2',
          label: 'Long-term Horizon',
          stage: '2_years',
          outcomeScenario: 'Accidental consultancy scaling with high administrative overhead.',
          riskProbability: 'medium',
          emotionalPayoff: 'Comfortable but creatively restless',
        },
      ],
    },
    {
      id: 'opt-open-source',
      title: 'Option B: 100% Focus on Open-Source Launch',
      description: 'Decline the retainer. Commit 4 months of pure focus to ship v1.0 and launch commercial sponsorship.',
      timeline1Mo: 'High creative flow and rapid architectural momentum. Savings burn rate is visible and felt daily.',
      timeline6Mo: 'Product launched to strong community adoption. First enterprise sponsor licenses acquired.',
      timeline2Yr: 'Independent product studio with true sovereignty and scalable software equity.',
      scorecard: {
        riskScore: 7,
        fulfillmentScore: 9,
        reversibilityScore: 5,
        valuesAlignmentScore: 10,
      },
      pros: ['Complete vector alignment', 'Uninterrupted 4-hour morning focus blocks', 'High equity upside'],
      cons: ['Runway burns steadily', 'Higher financial pressure on initial launch success'],
      branches: [
        {
          id: 'b-os-1',
          label: 'Launch Horizon',
          stage: '6_months',
          outcomeScenario: 'V1 launch reaches top of Hacker News; 3 enterprise design partners sign up.',
          riskProbability: 'medium',
          emotionalPayoff: 'Deep fulfillment and agency',
        },
      ],
    },
  ],
  historicalContext: {
    relevantPreviousDecisions: [
      'Declined enterprise Staff Architect offer (75 days ago) to preserve creative agency.',
    ],
    recurringValues: [
      'Creative autonomy takes precedence over corporate status',
      'Vector is more important than velocity',
    ],
    relevantPatterns: [
      'You experience initial post-decisional anxiety that rapidly transforms into clarity when choosing agency over security.',
    ],
    unresolvedTensions: [
      'Desire for financial predictability vs. acute intolerance for calendar fragmentation.',
    ],
    advisoryNote: 'Historically, whenever you chose safety over agency, you experienced creative restlessness within 90 days.',
  },
  pressureTest: {
    preMortemFailureScenario: 'Imagine Option A fails 12 months from now: The client gradually expanded scope to 30 hrs/week, you became resentful, and your open-source product was scooped by a competitor.',
    blindSpotWarning: 'You are assuming the client will respect the 20-hour boundary without aggressive pushback.',
    stressFactors: ['Emergency client production outages', 'Runway anxiety during quiet months'],
    mitigationStrategy: 'Offer the client an advisory audit package (5 hrs/week capped at a premium rate) instead of an operational retainer.',
  },
};
