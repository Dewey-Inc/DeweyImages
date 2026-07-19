import assert from 'node:assert';
import express from 'express';
import { User } from '../../types';
const router = express.Router();

// get the acces token needed to query user info from discord
async function getAccessToken(code: string) {
    assert(
        typeof process.env.API_URL === "string" &&
        typeof process.env.API_PATH === "string" &&
        typeof process.env.CLIENT_ID === "string" &&
        typeof process.env.CLIENT_SECRET === "string"
    )
    const accessRes = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': `${process.env.API_URL+process.env.API_PATH}/auth/final`,
            'client_id': process.env.CLIENT_ID,
            'client_secret': process.env.CLIENT_SECRET
        }),
    });
    const body: any = await accessRes.json();
    return body.access_token;
}

// oAtuh2 whatever to get the user's id
async function oAuth(code: string) {
    const accessToken = await getAccessToken(code);
    const tokenRes = await fetch('https://discord.com/api/users/@me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const body: any = await tokenRes.json();
    return body.id
}

router.get('/', async function(req: express.Request, res: express.Response) {
    if (typeof req.query.code !== "string" || req.query.state !== req.session.state) {
        return res.status(400).json({ message: "400: Invalid authentication request"})
    }

    const id = await oAuth(req.query.code);
    if (!id) {
        return res.status(400).json({ message: "400: Invalid authentication request"})
    }

    req.session.user = await User.get(id)
    if (!req.session.user) {
        return res.status(401).json({ message: "401: Couldn't find user on the server"})
    }

    return res.json(req.session.user)
});

module.exports = router;