module.exports = async function handler(req, res) {
  // ── CORS headers (required for browser fetch) ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set in Vercel Environment Variables'
    });
  }

  // Parse body
  let prompt;
  try {
    prompt = req.body?.prompt;
  } catch (e) {
    return res.status(400).json({ error: 'Could not parse request body' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided in request body' });
  }

  // Call Gemini
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1200,
        }
      })
    });

    const data = await geminiRes.json();

    // If Gemini returned an error object
    if (!geminiRes.ok || data.error) {
      return res.status(geminiRes.status || 500).json({
        error: data.error?.message || `Gemini returned status ${geminiRes.status}`
      });
    }

    // Extract text from response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: 'Gemini returned empty response',
        raw: JSON.stringify(data).slice(0, 300)
      });
    }

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({
      error: `Server fetch failed: ${err.message}`
    });
  }
}
