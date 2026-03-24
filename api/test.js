module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(200).json({
      status: 'ERROR',
      message: 'GEMINI_API_KEY is NOT set in Vercel environment variables'
    });
  }
  return res.status(200).json({
    status: 'OK',
    message: 'GEMINI_API_KEY is set',
    preview: key.slice(0, 8) + '...' // shows first 8 chars only, safe to check
  });
};
