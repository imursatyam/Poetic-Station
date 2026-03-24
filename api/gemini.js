module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Get Groq API key from Vercel environment variable
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not set in Vercel Environment Variables' });
  }

  let prompt;
  try { prompt = req.body?.prompt; } catch(e) {
    return res.status(400).json({ error: 'Could not parse request body' });
  }
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 1200
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok || data.error) {
      return res.status(groqRes.status || 500).json({
        error: data.error?.message || 'Groq returned status ' + groqRes.status
      });
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text) return res.status(500).json({ error: 'Groq returned empty response' });

    return res.status(200).json({ text });

  } catch(err) {
    return res.status(500).json({ error: 'Server fetch failed: ' + err.message });
  }
};
