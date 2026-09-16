const { json, makeSession, cookieName } = require('../_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!process.env.CASA_SESSION_SECRET || !process.env.CASA_ADMIN_PASSWORD) return json(res, 503, { error: 'Login online belum dikonfigurasi di Vercel.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const username = String(body.username || '');
  const password = String(body.password || '');
  if (username !== String(process.env.CASA_ADMIN_USERNAME || 'admin') || password !== process.env.CASA_ADMIN_PASSWORD) return json(res, 401, { error: 'Nama pengguna atau kata sandi belum benar.' });
  const token = makeSession(username);
  return json(res, 200, { ok: true, username }, { 'Set-Cookie': `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800` });
};
