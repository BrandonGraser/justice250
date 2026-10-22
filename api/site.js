const fs = require('fs');
const path = require('path');

function escapeAttribute(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceMeta(html, selector, value) {
  const escaped = escapeAttribute(value);
  const pattern = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*("\\s*>)`, 'i');
  return html.replace(pattern, `$1${escaped}$2`);
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).send('Method not allowed');
  }

  let html;
  try {
    html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  } catch (error) {
    return res.status(500).send('Site template unavailable');
  }

  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'content.json', limit: 1 });
    if (blobs.length) {
      const response = await fetch(`${blobs[0].url}?ts=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const content = await response.json();
        const metadata = content && content.metadata;
        if (metadata) {
          const title = metadata.title || 'Justice & The Next 250';
          const description = metadata.description || '';
          const socialTitle = metadata.socialTitle || title;
          const socialDescription = metadata.socialDescription || description;
          const socialImage = metadata.socialImage || '';

          html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
          html = replaceMeta(html, 'name="description"', description);
          html = replaceMeta(html, 'property="og:title"', socialTitle);
          html = replaceMeta(html, 'property="og:description"', socialDescription);
          html = replaceMeta(html, 'property="og:image"', socialImage);
          html = replaceMeta(html, 'name="twitter:title"', socialTitle);
          html = replaceMeta(html, 'name="twitter:description"', socialDescription);
          html = replaceMeta(html, 'name="twitter:image"', socialImage);
        }
      }
    }
  } catch (error) {
    // Keep serving the bundled page defaults if Blob is temporarily unavailable.
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).send(req.method === 'HEAD' ? '' : html);
};
