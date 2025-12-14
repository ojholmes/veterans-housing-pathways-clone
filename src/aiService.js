require('dotenv').config();
const fetch = globalThis.fetch || require('node-fetch');

async function summarizeProgressText(text) {
  if (!text) return '';
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fallback heuristic: extract first 2-3 sentences and simple keywords
    const sentences = text.split(/[\.\n]/).map(s => s.trim()).filter(Boolean);
    const first = sentences.slice(0, 3).join('. ');
    const actions = (text.match(/\b(call|referred|applied|scheduled|completed|follow[- ]?up|visit|inspection)\b/gi) || []).slice(0,5);
    const sentiment = /(good|positive|stable|improved)/i.test(text) ? 'positive' : (/wors|concern|risk|needs/i.test(text) ? 'concern' : 'neutral');
    return `Summary: ${first}${first ? '.' : ''} Actions: ${actions.join(', ') || 'none'}; Sentiment: ${sentiment}.`;
  }

  // Call OpenAI Chat Completion (gpt-3.5-turbo) via REST to avoid SDK version mismatch
  try {
    const prompt = `Extract a concise summary (1-3 sentences), list key actions taken, identify client's sentiment (positive/neutral/concern), and recommend next steps from the following long progress note:\n\n"""\n${text}\n"""`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.1
      })
    });

    const data = await resp.json();
    if (data && data.choices && data.choices[0]) {
      return data.choices[0].message.content.trim();
    }
    return '';
  } catch (err) {
    console.error('AI summarization failed:', err);
    return '';
  }
}

module.exports = { summarizeProgressText };
