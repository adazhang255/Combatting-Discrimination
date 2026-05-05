const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3001;
const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'gemma3:4b';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/health', async (req, res) => {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!r.ok) throw new Error('Ollama not responding');
    const data = await r.json();
    const models = (data.models || []).map(m => m.name);
    const hasModel = models.some(m => m.startsWith(MODEL));
    if (!hasModel) {
      return res.status(503).json({ ok: false, error: `Model "${MODEL}" not found. Run: ollama pull ${MODEL}` });
    }
    res.json({ ok: true, model: MODEL });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.post('/chat', async (req, res) => {
  const { message, mode, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  const systemPrompt = getSystemPrompt(mode);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // send headers immediately so the client can start reading

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ],
        stream: true,
        options: { temperature: 0.75, top_p: 0.92, num_predict: 300 }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      res.write(`data: ${JSON.stringify({ error: `Ollama error ${response.status}: ${text}` })}\n\n`);
      res.end();
      return;
    }

    let buf = '';
    response.body.on('data', (chunk) => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            res.write(`data: ${JSON.stringify({ token: json.message.content })}\n\n`);
          }
          if (json.done && !res.writableEnded) {
            res.write('data: [DONE]\n\n');
            res.end();
          }
        } catch { /* skip malformed lines */ }
      }
    });

    response.body.on('end', () => {
      if (!res.writableEnded) { res.write('data: [DONE]\n\n'); res.end(); }
    });

    response.body.on('error', () => {
      if (!res.writableEnded) res.end();
    });

  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

function getSystemPrompt(mode) {
  const shared = `You are a supportive educational assistant for people experiencing discrimination. You are not an attorney and this is educational information, not legal advice — but you do not need to repeat this as a disclaimer in every response. You cover workplace rights, school/university rights, housing discrimination, and public accommodations.

Be empathetic, direct, and specific to the user's situation. Vary your tone and structure based on what they describe. Keep responses under 200 words.`;

  if (mode === 'identify') {
    return `${shared}

Your task: Help identify whether the described conduct may involve discrimination, harassment, or retaliation. Name the likely category (e.g., race/color, religion, sex/gender, age, disability, national origin, housing, Title IX, public accommodation, or retaliation) and explain which specific facts point toward or away from that conclusion. Be honest about uncertainty — if there is not enough information, say what you would need to know.`;
  }

  return `${shared}

Your task: Give 2–4 concrete next steps tailored to what the user described. 
Prioritize the most relevant actions for their specific situation — 
this might be documenting evidence, checking internal HR channels, contacting a specific agency (EEOC, Title IX office, HUD, state civil rights agency, local legal aid), or seeking support. 
Do not give a generic checklist; respond to the details they shared.`;
}

app.listen(PORT, () => {
  console.log(`\n✓ Equity Navigator AI server running`);
  console.log(`  App:    http://localhost:${PORT}`);
  console.log(`  Model:  ${MODEL} (via Ollama)`);
  console.log(`\n  If the model isn't downloaded yet, run:`);
  console.log(`  ollama pull ${MODEL}\n`);
});
