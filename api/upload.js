// POST /api/upload  { password, name, dataBase64 } -> commits an image to assets/cms/ in the repo.
const REPO = process.env.GITHUB_REPO || 'BrandonGraser/justice250';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, name, dataBase64 } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD / GITHUB_TOKEN are not configured in Vercel' });
  }
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  if (!name || !dataBase64) return res.status(400).json({ error: 'Missing file' });
  if (dataBase64.length > 8_000_000) return res.status(413).json({ error: 'Image too large' });

  const safe = String(name).replace(/[^\w.-]+/g, '_').slice(0, 80);
  const path = `assets/cms/${Date.now()}-${safe}`;
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'jn250-editor',
      },
      body: JSON.stringify({ message: 'Upload image via editor', content: dataBase64, branch: BRANCH }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || `GitHub error ${r.status}`);
    return res.status(200).json({ ok: true, path });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
