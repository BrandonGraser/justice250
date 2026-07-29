// GET /api/content -> the current site content.
// Serves the latest published version from Vercel Blob; falls back to the
// bundled content.json (first run, before anything has been published).
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'content.json', limit: 1 });
    if (blobs.length) {
      const r = await fetch(blobs[0].url + '?ts=' + Date.now(), { cache: 'no-store' });
      if (r.ok) return res.status(200).json(await r.json());
    }
  } catch (e) {
    // fall through to the bundled default
  }
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const r = await fetch(`${proto}://${host}/content.json`);
    if (r.ok) return res.status(200).json(await r.json());
  } catch (e) {}
  return res.status(404).json({ error: 'No content found' });
};
