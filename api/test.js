module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(200).json({
      status: 'ERROR',
      message: 'GROQ_API_KEY is NOT set in Vercel environment variables'
    });
  }
  return res.status(200).json({
    status: 'OK',
    message: 'GROQ_API_KEY is set',
    preview: key.slice(0, 8) + '...'
  });
};
