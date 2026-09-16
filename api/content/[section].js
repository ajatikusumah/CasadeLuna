const { json, requireSession, github, githubConfig } = require('../_lib');
const allowed = new Set(['gallery', 'cats', 'stories', 'pet-care', 'settings']);

module.exports = async (req, res) => {
  const section = String(req.query?.section || '').replace(/[^a-z-]/g, '');
  if (!allowed.has(section)) return json(res, 404, { error: 'Konten tidak ditemukan.' });
  if (req.method === 'GET') {
    try {
      const file = await github(`content/${section}.json`);
      return json(res, 200, JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')));
    } catch (error) { return json(res, 502, { error: error.message }); }
  }
  if (req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' });
  if (!requireSession(req, res)) return;
  try {
    const config = githubConfig();
    const current = await github(`content/${section}.json`);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || 'null') : req.body;
    if (body == null) return json(res, 400, { error: 'Data kosong.' });
    const commit = await github(`content/${section}.json`, { method: 'PUT', body: JSON.stringify({ message: `Update Casa de Luna ${section}`, content: Buffer.from(JSON.stringify(body, null, 2) + '\n').toString('base64'), sha: current.sha, branch: config.branch, }) });
    return json(res, 200, { ok: true, commit: commit.commit?.sha || null });
  } catch (error) { return json(res, 502, { error: error.message }); }
};
