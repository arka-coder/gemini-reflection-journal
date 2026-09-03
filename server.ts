import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();

// Port Resolution:
// In dev mode (NODE_ENV !== 'production'), the dev server must bind strictly to port 3000
// because AI Studio's internal reverse proxy routes externally through port 3000.
// In production (Cloud Run), Cloud Run dynamically assigns process.env.PORT (typically 8080).
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Top-Level Request Deserialization (Ordering Guarantee)
// Mount body parsers BEFORE any endpoint routes
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Lazy-initialize Google GenAI client to prevent startup crashes if key is delayed
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Resilient Model Fallback Ladder
// gemini-3.8-flash: Recommended primary text model with high availability and speed
// gemini-flash-latest: Dynamic alias routing to active flash endpoints
// gemini-3.1-flash-lite: High-availability lite fallback
// gemini-3.6-flash: Preceding generation fallback
// gemini-3.7-flash: Deep reasoning fallback
const MODEL_FALLBACK_LADDER = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
];

interface FallbackGenerateParams {
  contents: any;
  systemInstruction?: string;
  temperature?: number;
}

async function generateContentWithFallback(params: FallbackGenerateParams): Promise<{ text: string; modelUsed: string }> {
  const ai = getGenAI();
  let lastError: any = null;

  for (let i = 0; i < MODEL_FALLBACK_LADDER.length; i++) {
    const model = MODEL_FALLBACK_LADDER[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature ?? 0.7,
        },
      });

      const responseText = response.text || '';
      return { text: responseText, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || (err?.message && err.message.match(/\b(503|429|404|500)\b/)?.[0]);
      console.log(`[Gemini Availability] Model ${model} unavailable (status: ${status || 'temporary'}). Cascading to fallback ladder...`);
      
      // If temporary 503 or 429 occurs, pause briefly before invoking next model in ladder
      if (i < MODEL_FALLBACK_LADDER.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }

  throw new Error(`All Gemini models in the fallback ladder failed. Last error: ${lastError?.message || lastError}`);
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Gemini Multi-turn Reflection & Interaction API
app.post('/api/gemini/reflect', async (req, res) => {
  try {
    // Defensive Payload Ingestion (Null-Safe Destructuring)
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const {
      prompt = '',
      history = [],
      mode = 'reflection',
      entryTitle = '',
      entryBody = '',
    } = body;

    const userPrompt = typeof prompt === 'string' ? prompt.trim() : '';

    if (!userPrompt && !entryBody) {
      return res.status(400).json({
        error: 'Either a user prompt or journal entry text must be provided.',
      });
    }

    let systemInstruction = `You are a supportive, insightful, and empathetic AI reflection companion and journaling mentor.
Your role is to help the user unpack their thoughts, explore underlying emotions, discover constructive perspectives, and reflect deeply on their experiences.
Maintain a warm, compassionate, non-judgmental, and intellectually curious tone.
When appropriate, offer thoughtful open-ended questions that provoke meaningful introspection.
Format your responses with clean, readable Markdown (using bold headings, short paragraphs, or bullet points where fitting).`;

    if (mode === 'summary') {
      systemInstruction += `\nSPECIFIC TASK: Provide a thoughtful, structured summary of the reflection or journal entry. Identify:
1. Core Themes & Emotional Undertones
2. Key Realizations or Insights
3. Constructive Next Steps or Reflection Questions. Keep it clear, grounding, and actionable.`;
    } else if (mode === 'brainstorm') {
      systemInstruction += `\nSPECIFIC TASK: Brainstorm creative angles, alternative viewpoints, growth opportunities, and actionable thought experiments based on what the user shared.`;
    } else if (mode === 'reflection') {
      systemInstruction += `\nSPECIFIC TASK: Offer deep empathetic reflection, validate their feelings with nuanced understanding, and ask 1-2 powerful introspective questions to guide their ongoing self-discovery.`;
    }

    // Build multi-turn contents array
    const contents: any[] = [];

    // Context from current entry if available
    let contextHeader = '';
    if (entryTitle || entryBody) {
      contextHeader = `[Context - Current Journal Entry]\n`;
      if (entryTitle) contextHeader += `Title: ${entryTitle}\n`;
      if (entryBody) contextHeader += `Content:\n${entryBody}\n`;
      contextHeader += `--- End of Context ---`;
    }

    // Include prior multi-turn conversation turns
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history) {
        if (turn && typeof turn === 'object' && turn.role && turn.text) {
          const role = turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: String(turn.text) }],
          });
        }
      }
    }

    // Prepare current turn
    let currentTurnText = userPrompt;
    if (contextHeader && contents.length === 0) {
      currentTurnText = `${contextHeader}\n\n${userPrompt || 'Please reflect on this journal entry.'}`;
    } else if (contextHeader && contents.length > 0 && userPrompt) {
      currentTurnText = userPrompt;
    }

    if (!currentTurnText) {
      currentTurnText = 'Please provide reflections on my journal entry.';
    }

    contents.push({
      role: 'user',
      parts: [{ text: currentTurnText }],
    });

    const result = await generateContentWithFallback({
      contents,
      systemInstruction,
      temperature: 0.7,
    });

    return res.json({
      success: true,
      text: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/reflect:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process AI reflection.',
    });
  }
});

async function startServer() {
  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, locate the built static frontend assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // API catch-all to return clean 404 JSON rather than HTML SPA fallback
    app.all('/api/*', (req, res) => {
      res.status(404).json({ error: `API route ${req.method} ${req.path} not found.` });
    });

    // SPA client fallback for non-API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Primary Server Listener
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });

  // In production (Cloud Run), if PORT was assigned to something other than 3000 (e.g. 8080),
  // optionally bind to 3000 as well so health checks or internal proxies on either port succeed.
  if (isProduction && PORT !== 3000) {
    try {
      const secondaryServer = app.listen(3000, '0.0.0.0', () => {
        console.log('Dual-port fallback listener active on http://0.0.0.0:3000');
      });
      secondaryServer.on('error', (err: any) => {
        // Port 3000 might already be bound or prohibited; non-fatal
        console.log('Secondary port 3000 fallback skipped:', err?.message);
      });
    } catch (err: any) {
      console.log('Secondary port 3000 setup skipped:', err?.message);
    }
  }
}

startServer();
