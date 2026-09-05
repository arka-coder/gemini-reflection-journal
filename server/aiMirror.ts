import express, { Request, Response } from 'express';

export function createAiMirrorRouter(
  generateContentWithFallback: (params: {
    contents: any;
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
  }) => Promise<{ text: string; modelUsed: string }>,
  safeParseJson: <T>(rawText: string, fallback: T) => T
) {
  const router = express.Router();

  // 1. EXTRACT MEMORIES
  router.post('/extract-memories', async (req: Request, res: Response) => {
    try {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const { entryId = '', title = '', body: entryBody = '', mood = 'neutral' } = body;

      if (!entryBody && !title) {
        return res.status(400).json({ error: 'Entry title or body required for memory extraction.' });
      }

      const systemInstruction = `You are the Personal Memory Extraction Engine for Reflection Journal.
Analyze the user's reflection or journal entry and extract 2-6 discrete, meaningful memory units.

CRITICAL RULES:
1. Distinguish strictly between:
   - 'USER_FACT': Explicit factual statements about their real life, career, or circumstances (e.g., 'Works in engineering', 'Lives in Chicago').
   - 'AI_INFERENCE': Thoughtful, deduced insights regarding their values, tendencies, emotional patterns, or habits (e.g., 'Values deep mastery over rapid promotion', 'Tends to hesitate when making public commitments').
   - 'SIMULATED_POSSIBILITY': Speculative future outcomes.
2. NEVER convert an AI inference into a user fact.
3. Allowed categories:
   - 'facts'
   - 'values'
   - 'goals'
   - 'preferences'
   - 'recurring_themes'
   - 'emotional_patterns'
   - 'decision_patterns'
   - 'strengths'
   - 'possible_blind_spots'
   - 'important_decisions'
   - 'contradictions'
   - 'unresolved_questions'
4. Language must be non-clinical and non-judgmental. Do NOT use clinical psychiatric diagnoses.
5. Return ONLY a valid JSON array of objects with:
   [
     {
       "type": string,
       "content": string,
       "classification": "USER_FACT" | "AI_INFERENCE",
       "confidence": number (0-100),
       "confidenceLevel": "low" | "medium" | "high",
       "contextSnippet": string
     }
   ]`;

      const promptText = `Entry Title: ${title}\nMood: ${mood}\nContent:\n${entryBody}`;
      const result = await generateContentWithFallback({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
      });

      const extractedItems = safeParseJson<any[]>(result.text, []);
      const sanitized = extractedItems.map((item, idx) => ({
        id: `mem-${Date.now()}-${idx}`,
        type: item.type || 'recurring_themes',
        content: item.content || '',
        classification: item.classification === 'USER_FACT' ? 'USER_FACT' : 'AI_INFERENCE',
        sourceEntryIds: entryId ? [entryId] : [],
        createdAt: Date.now(),
        lastSeenAt: Date.now(),
        confidence: typeof item.confidence === 'number' ? item.confidence : 80,
        confidenceLevel: item.confidenceLevel || 'medium',
        evidenceCount: 1,
        contextSnippet: item.contextSnippet || '',
      })).filter((m) => Boolean(m.content));

      return res.json({ success: true, memories: sanitized, modelUsed: result.modelUsed });
    } catch (error: any) {
      console.error('Error in /extract-memories:', error);
      return res.status(500).json({ error: error?.message || 'Memory extraction failed.' });
    }
  });

  // 2. MIRROR ANALYSIS (PATTERNS, THEMES, BLIND SPOTS, CONTRADICTIONS, LIFE GRAPH)
  router.post('/mirror-analysis', async (req: Request, res: Response) => {
    try {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const { entries = [], memories = [] } = body;

      if (!Array.isArray(entries) || entries.length === 0) {
        return res.json({
          success: true,
          insight: {
            headline: 'Your Reflective Mindspace is Beginning',
            observation: 'As you record more reflections and decisions, Reflection Journal will gradually map out your core recurring themes, emotional rhythms, decision patterns, and productive tensions.',
            confidenceScore: 70,
            groundedQuotes: [],
            strengths: [
              {
                title: 'Proactive Self-Inquiry',
                description: 'You have begun the process of deliberate contemplation and intentional decision-making.',
                evidence: 'Initial entry created in Reflection Journal.',
              },
            ],
            possibleBlindSpots: [
              {
                title: 'Early Baseline',
                observation: 'With limited historical entries, patterns are still forming.',
                suggestion: 'Write freely over several days to uncover your true underlying decision vectors.',
                evidence: 'Growing reflection history.',
              },
            ],
            emotionalTrends: [{ emotion: 'Curious', trajectory: 'rising', note: 'Approaching self-reflection with openness.' }],
            changesOverTime: [{ period: 'Present', shift: 'Establishing intentional journaling ritual', evidence: 'Active session' }],
            lastUpdated: Date.now(),
          },
          patterns: [],
          contradictions: [],
          graphNodes: [
            {
              id: 'node-self',
              label: 'Self-Direction',
              type: 'theme',
              mentions: 1,
              confidence: 75,
              supportingEntryIds: [],
              commonTriggers: ['New beginnings'],
              associatedEmotions: ['Reflective'],
              timeline: [{ date: Date.now(), note: 'Initial mindspace formed' }],
            },
          ],
          graphEdges: [],
        });
      }

      const systemInstruction = `You are Reflection Journal's AI Mirror Synthesis Core.
Analyze the user's reflection history and memories to reveal profound personal patterns, recurring themes, strengths, constructive blind spots, contradictions/tensions, and an interconnected Life Graph.

CORE RULES:
1. Speak as an intelligent mirror that remembers how the user thinks over time.
2. Ground all insights in their actual words.
3. NEVER make psychiatric or clinical diagnoses. Use nuanced observational language: 'possible pattern', 'this may suggest', 'appears repeatedly', 'based on your previous reflections'.
4. Formulate tensions respectfully ('Tension detected', 'Your perspective may be changing', 'Two goals appear in productive friction').
5. Construct a Life Graph of 5-10 nodes (types: theme, goal, value, emotion, decision_pattern) and 4-10 connecting edges representing real causal or thematic relationships.

Return ONLY a valid JSON object matching:
{
  "insight": {
    "headline": string,
    "observation": string (2-3 paragraphs),
    "confidenceScore": number (70-98),
    "groundedQuotes": string[],
    "strengths": [{ "title": string, "description": string, "evidence": string }],
    "possibleBlindSpots": [{ "title": string, "observation": string, "suggestion": string, "evidence": string }],
    "emotionalTrends": [{ "emotion": string, "trajectory": "rising" | "steady" | "easing", "note": string }],
    "changesOverTime": [{ "period": string, "shift": string, "evidence": string }]
  },
  "patterns": [
    {
      "id": string,
      "title": string,
      "description": string,
      "category": "repeated_theme" | "recurring_emotion" | "decision_behavior" | "common_trigger" | "avoidance" | "perspective_shift" | "uncertainty" | "validation_seeking",
      "confidence": number (60-100),
      "confidenceLevel": "low" | "medium" | "high",
      "sourceEntryIds": string[],
      "trend": "increasing" | "stable" | "evolving" | "subsiding",
      "impactArea": string
    }
  ],
  "contradictions": [
    {
      "id": string,
      "title": string,
      "tensionType": "value_vs_behavior" | "goal_vs_goal" | "conflicting_preferences" | "changing_perspective" | "intention_without_action" | "independence_vs_reassurance" | "certainty_vs_risk",
      "statementA": string,
      "sourceA": { "id": string, "date": number, "title": string, "excerpt": string },
      "statementB": string,
      "sourceB": { "id": string, "date": number, "title": string, "excerpt": string },
      "insight": string,
      "confidence": number
    }
  ],
  "graphNodes": [
    {
      "id": string,
      "label": string,
      "type": "theme" | "goal" | "value" | "emotion" | "decision_pattern",
      "mentions": number,
      "confidence": number,
      "supportingEntryIds": string[],
      "commonTriggers": string[],
      "associatedEmotions": string[],
      "timeline": [{ "date": number, "note": string }]
    }
  ],
  "graphEdges": [
    {
      "id": string,
      "source": string,
      "target": string,
      "relation": string,
      "strength": number,
      "evidenceCount": number
    }
  ]
}`;

      const entriesSummary = entries.slice(0, 15).map((e: any, i: number) => ({
        id: e.id || `entry-${i}`,
        title: e.title,
        date: e.createdAt,
        mood: e.mood,
        contentExcerpt: (e.body || '').slice(0, 500),
      }));

      const memoriesSummary = memories.slice(0, 20).map((m: any) => ({
        type: m.type,
        content: m.content,
        classification: m.classification,
      }));

      const payload = `User Reflection Entries:\n${JSON.stringify(entriesSummary, null, 2)}\n\nExtracted User Memories:\n${JSON.stringify(memoriesSummary, null, 2)}`;

      const result = await generateContentWithFallback({
        contents: [{ role: 'user', parts: [{ text: payload }] }],
        systemInstruction,
        temperature: 0.4,
        responseMimeType: 'application/json',
      });

      const parsed = safeParseJson<any>(result.text, {});

      return res.json({
        success: true,
        insight: {
          ...(parsed.insight || {}),
          lastUpdated: Date.now(),
        },
        patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
        contradictions: Array.isArray(parsed.contradictions) ? parsed.contradictions : [],
        graphNodes: Array.isArray(parsed.graphNodes) ? parsed.graphNodes : [],
        graphEdges: Array.isArray(parsed.graphEdges) ? parsed.graphEdges : [],
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error('Error in /mirror-analysis:', error);
      return res.status(500).json({ error: error?.message || 'Mirror analysis failed.' });
    }
  });

  // 3. ASK YOUR PAST SELF
  router.post('/ask-past-self', async (req: Request, res: Response) => {
    try {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const { question = '', entries = [], memories = [] } = body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required.' });
      }

      const systemInstruction = `You are Reflection Journal's 'Ask Your Past Self' engine.
The user is asking a question about their past thoughts, decisions, emotions, or values.
Answer strictly based on the provided reflection entries and memories.

MANDATORY RULES:
1. If the provided entries/memories have little or no relevant evidence regarding the query, set:
   "hasSufficientEvidence": false
   "synthesis": "There isn't enough historical evidence in your recorded reflections yet to answer this definitively."
2. Never hallucinate or invent past reflections.
3. Compare: what changed vs. what stayed the same over time.
4. List specific supporting entries with real excerpts and relevance scores (0-100).
5. Suggest an introspective follow-up inquiry.

Output MUST be valid JSON:
{
  "query": string,
  "hasSufficientEvidence": boolean,
  "synthesis": string,
  "whatChanged": string,
  "whatStayedTheSame": string,
  "relevantEntries": [
    {
      "id": string,
      "title": string,
      "date": number,
      "relevance": number,
      "excerpt": string
    }
  ],
  "suggestedFollowUp": string
}`;

      const entriesData = entries.map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.createdAt,
        content: e.body,
      }));

      const userPrompt = `Question from user: "${question}"\n\nUser's Historical Records:\n${JSON.stringify(entriesData, null, 2)}\n\nMemories:\n${JSON.stringify(memories, null, 2)}`;

      const result = await generateContentWithFallback({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
      });

      const parsed = safeParseJson<any>(result.text, {
        query: question,
        hasSufficientEvidence: false,
        synthesis: "There isn't enough historical evidence in your reflections yet to answer this definitively.",
        whatChanged: 'Not enough data points yet.',
        whatStayedTheSame: 'Not enough data points yet.',
        relevantEntries: [],
      });

      return res.json({ success: true, answer: parsed, modelUsed: result.modelUsed });
    } catch (error: any) {
      console.error('Error in /ask-past-self:', error);
      return res.status(500).json({ error: error?.message || 'Past self query failed.' });
    }
  });

  // 4. FUTURE ME (SIMULATED POSSIBILITIES)
  router.post('/future-me', async (req: Request, res: Response) => {
    try {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const { patterns = [], recentEntries = [], memories = [] } = body;

      const systemInstruction = `You are Reflection Journal's 'Future Me' Trajectory Engine.
Based on the user's observed patterns and values, extrapolate 2-4 plausible future trajectories.

RULES:
1. NEVER claim to predict the future with certainty.
2. Label every trajectory as 'SIMULATED_POSSIBILITY'.
3. For each trajectory, articulate:
   - currentPattern: the behavior/mindset anchor
   - possibleTrajectory: what unfolds if continued unaltered
   - whyAiThinksThis: the reasoning grounded in their reflections
   - evidence: 2-3 specific behaviors or citations
   - pivotVariable: THE SINGLE ACTION, BOUNDARY, OR MINDSET SHIFT that changes this trajectory
   - timeframe: (e.g. '3 months', '6-12 months', '2 years')

Return ONLY a JSON array of trajectory objects:
[
  {
    "id": string,
    "currentPattern": string,
    "possibleTrajectory": string,
    "whyAiThinksThis": string,
    "evidence": string[],
    "sourceEntryIds": string[],
    "pivotVariable": string,
    "classification": "SIMULATED_POSSIBILITY",
    "timeframe": string
  }
]`;

      const promptData = `Patterns:\n${JSON.stringify(patterns, null, 2)}\n\nRecent Entries:\n${JSON.stringify(recentEntries.slice(0, 6), null, 2)}`;

      const result = await generateContentWithFallback({
        contents: [{ role: 'user', parts: [{ text: promptData }] }],
        systemInstruction,
        temperature: 0.5,
        responseMimeType: 'application/json',
      });

      const trajectories = safeParseJson<any[]>(result.text, []);

      return res.json({ success: true, trajectories, modelUsed: result.modelUsed });
    } catch (error: any) {
      console.error('Error in /future-me:', error);
      return res.status(500).json({ error: error?.message || 'Future Me simulation failed.' });
    }
  });

  // 5. DECISION INTELLIGENCE & FUTURE PATH SIMULATION
  router.post('/decision-intelligence', async (req: Request, res: Response) => {
    try {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const {
        decisionTitle = '',
        context = '',
        category = 'career',
        options = [],
        pastEntries = [],
        memories = [],
      } = body;

      if (!decisionTitle) {
        return res.status(400).json({ error: 'Decision title is required.' });
      }

      const systemInstruction = `You are Reflection Journal's Decision Intelligence & Future-Path Simulator.
Analyze the user's decision dilemma, connect it to relevant past reflections, generate 2-3 future branching options with timelines, scorecards, and a pre-mortem pressure test.

CRITICAL DIRECTIVES:
1. In 'historicalContext':
   - Highlight relevant past reflections, recurring core values, similar past situations, and unresolved tensions.
   - Ground it in the provided past entries and memories.
2. In 'options':
   - Provide 2-3 distinct strategic options (e.g., Option A, Option B, or Status Quo with intentional pivot).
   - For each option, outline:
     - 1-month horizon (immediate friction/adjustment)
     - 6-month horizon (systemic impact)
     - 2-year horizon (long-term identity and trajectory)
     - Scorecard: riskScore (1-10), fulfillmentScore (1-10), reversibilityScore (1-10), valuesAlignmentScore (1-10)
     - 2-3 Pros and 2-3 Cons
     - 2-3 branching sub-scenarios with outcomeScenario, riskProbability ('low'|'medium'|'high'), emotionalPayoff
3. In 'pressureTest':
   - preMortemFailureScenario: A vivid pre-mortem test ("Imagine it's 18 months from now and this choice went poorly—why did it fail?")
   - blindSpotWarning: Hidden assumption the user might be taking for granted
   - stressFactors: 2-3 real pressure points
   - mitigationStrategy: Specific proactive safety net or hedge

Return ONLY valid JSON:
{
  "historicalContext": {
    "relevantPreviousDecisions": string[],
    "recurringValues": string[],
    "relevantPatterns": string[],
    "unresolvedTensions": string[],
    "advisoryNote": string
  },
  "options": [
    {
      "id": string,
      "title": string,
      "description": string,
      "timeline1Mo": string,
      "timeline6Mo": string,
      "timeline2Yr": string,
      "scorecard": {
        "riskScore": number,
        "fulfillmentScore": number,
        "reversibilityScore": number,
        "valuesAlignmentScore": number
      },
      "pros": string[],
      "cons": string[],
      "branches": [
        {
          "id": string,
          "label": string,
          "stage": "immediate" | "1_month" | "6_months" | "2_years",
          "outcomeScenario": string,
          "riskProbability": "low" | "medium" | "high",
          "emotionalPayoff": string
        }
      ]
    }
  ],
  "pressureTest": {
    "preMortemFailureScenario": string,
    "blindSpotWarning": string,
    "stressFactors": string[],
    "mitigationStrategy": string
  }
}`;

      const promptData = `Decision Title: ${decisionTitle}\nCategory: ${category}\nContext / Dilemma: ${context}\nExisting Options Considered: ${JSON.stringify(options)}\n\nUser Historical Entries:\n${JSON.stringify(pastEntries.slice(0, 10), null, 2)}\n\nUser Memory Bank:\n${JSON.stringify(memories.slice(0, 15), null, 2)}`;

      const result = await generateContentWithFallback({
        contents: [{ role: 'user', parts: [{ text: promptData }] }],
        systemInstruction,
        temperature: 0.4,
        responseMimeType: 'application/json',
      });

      const parsed = safeParseJson<any>(result.text, {});

      return res.json({ success: true, decision: parsed, modelUsed: result.modelUsed });
    } catch (error: any) {
      console.error('Error in /decision-intelligence:', error);
      return res.status(500).json({ error: error?.message || 'Decision intelligence analysis failed.' });
    }
  });

  return router;
}
