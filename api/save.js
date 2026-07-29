// POST /api/save  { password, content } -> commits content.json to the GitHub repo.
// Vercel redeploys on the commit, so the live site updates automatically.
const REPO = process.env.GITHUB_REPO || 'BrandonGraser/justice250';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

async function gh(path, token, opts = {}) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'jn250-editor',
      ...(opts.headers || {}),
    },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message || `GitHub error ${r.status}`);
  return j;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, content } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD / GITHUB_TOKEN are not configured in Vercel' });
  }
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  if (!content || typeof content !== 'object') return res.status(400).json({ error: 'Missing content' });

  try {
    const token = process.env.GITHUB_TOKEN;
    const current = await gh(`contents/content.json?ref=${BRANCH}`, token);
    const body = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
    const result = await gh('contents/content.json', token, {
      method: 'PUT',
      body: JSON.stringify({
        message: 'Update site content via editor',
        content: body,
        sha: current.sha,
        branch: BRANCH,
      }),
    });
    return res.status(200).json({ ok: true, sha: result.content.sha });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
