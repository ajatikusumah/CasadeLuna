const crypto = require('crypto');

const cookieName = 'casa_de_luna_session';
const ttlSeconds = 60 * 60 * 8;

function json(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  Object.entries(extraHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}

function secret() {
  return process.env.CASA_SESSION_SECRET || process.env.SESSION_SECRET || '';
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

function makeSession(username) {
  const payload = Buffer.from(JSON.stringify({ username, exp: Date.now() + ttlSeconds * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readSession(req) {
  const cookies = String(req.headers.cookie || '').split(';').reduce((all, part) => {
    const [key, ...value] = part.trim().split('=');
    if (key) all[key] = decodeURIComponent(value.join('='));
    return all;
  }, {});
  const token = cookies[cookieName];
  if (!token || !secret()) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch (_) { return null; }
}

function requireSession(req, res) {
  const session = readSession(req);
  if (!session) { json(res, 401, { error: 'Sesi admin tidak valid atau sudah berakhir.' }); return null; }
  return session;
}

function githubConfig() {
  return {
    owner: process.env.GITHUB_OWNER || 'ajatikusumah',
    repo: process.env.GITHUB_REPO || 'CasadeLuna',
    branch: process.env.GITHUB_BRANCH || 'main',
    token: process.env.GITHUB_TOKEN || ''
  };
}

async function github(path, options = {}) {
  const config = githubConfig();
  if (!config.token) throw new Error('GITHUB_TOKEN belum dikonfigurasi di Vercel.');
  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`, {
    ...options,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${config.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `GitHub API error ${response.status}`);
  return body;
}

module.exports = { cookieName, ttlSeconds, json, sign, makeSession, readSession, requireSession, github, githubConfig };
