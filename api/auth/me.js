const { json, readSession } = require('../_lib');
module.exports = (req, res) => json(res, 200, { authenticated: Boolean(readSession(req)) });
