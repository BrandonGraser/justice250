// GET /api/content -> the current site content.
// Fetch the stable pathname directly. Calling list() on every page view burns
// Blob advanced operations and can suspend a Hobby store.
function blobContentUrl() {
  const id = String(process.env.BLOB_STORE_ID || '').replace(/^store_/i, '').toLowerCase();
  return id ? `https://${id}.public.blob.vercel-storage.com/content.json` : '';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  let blobError = '';
  try {
    const url = blobContentUrl();
    if (url) {
      const r = await fetch(url + '?ts=' + Date.now(), { cache: 'no-store' });
      if (r.ok) {
        res.setHeader('X-Content-Source', 'blob');
        return res.status(200).json(await r.json());
      }
      blobError = `Blob returned ${r.status}`;
    } else {
      blobError = 'BLOB_STORE_ID is missing';
    }
  } catch (e) {
    blobError = e.message || 'Blob request failed';
  }
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const r = await fetch(`${proto}://${host}/content.json`);
    if (r.ok) {
      res.setHeader('X-Content-Source', 'bundled');
      res.setHeader('X-Content-Warning', blobError);
      return res.status(200).json(await r.json());
    }
  } catch (e) {}
  return res.status(404).json({ error: 'No content found' });
};
