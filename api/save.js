// POST /api/save  { password, content } -> stores content.json in Vercel Blob.
// Changes are live immediately; no redeploy needed.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, content } = req.body || {};
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured in Vercel' });
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  if (!content || typeof content !== 'object') return res.status(400).json({ error: 'Missing content' });

  try {
    const { put } = await import('@vercel/blob');
    await put('content.json', JSON.stringify(content, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      cacheControlMaxAge: 0,
      allowOverwrite: true,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
