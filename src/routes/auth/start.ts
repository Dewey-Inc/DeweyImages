import express from 'express';
import crypto from 'crypto';
const router = express.Router();

const oauthURL = process.env.OAUTH_URL

router.get('/', async function(req, res) {
    req.session.state = crypto.randomBytes(16).toString("base64url");
    res.redirect(`${oauthURL}&state=${req.session.state}`);
});

module.exports = router;