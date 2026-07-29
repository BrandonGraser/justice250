// POST /api/upload  { password, name, dataBase64 } -> stores an image in Vercel Blob,
// returns its public URL.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, name, dataBase64 } = req.body || {};
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured in Vercel' });
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  if (!name || !dataBase64) return res.status(400).json({ error: 'Missing file' });
  if (dataBase64.length > 8_000_000) return res.status(413).json({ error: 'Image too large' });

  try {
    const { put } = await import('@vercel/blob');
    const safe = String(name).replace(/[^\w.-]+/g, '_').slice(0, 80);
    const blob = await put(`cms/${Date.now()}-${safe}`, Buffer.from(dataBase64, 'base64'), {
      access: 'public',
      contentType: 'image/jpeg',
    });
    return res.status(200).json({ ok: true, path: blob.url });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
