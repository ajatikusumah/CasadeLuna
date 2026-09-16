const { json, cookieName } = require('../_lib');
module.exports = (req, res) => json(res, 200, { ok: true }, { 'Set-Cookie': `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
