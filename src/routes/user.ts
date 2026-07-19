import assert from 'node:assert';
import express from 'express';
import { User } from '../types.js';
const router = express.Router();

// returns the logged in user if the :id is @me
async function memebigboy(req: express.Request) {
    if (req.params.id !== "@me") {
        assert(typeof req.params.id == "string")
        return await User.get(req.params.id)
    } else if (!req.session.user) {
        return undefined
    }
    return req.session.user
}

router.get('/:id', async function(req, res: express.Response) {
    const user = await memebigboy(req)
    if (!user) {
        return res.status(404).json({ message: "404: Not found"} )
    }
    return res.json(user)
});

router.get('/:id/images', async function(req, res) {
    const user = await memebigboy(req)
    if (!user) {
        return res.status(404).json({ message: "404: Not found"} )
    }
    return res.json(user.images)
});

router.delete('/:id', async function(req, res) {
    if (!req.session.user || req.session.user.permission !== 2 ) {
        return res.status(401).json({ message: "401: Unauthorized"} )
    }

    const user = await memebigboy(req)
    if (!user) {
        return res.status(404).json({ message: "404: Not found"} )
    } else if (user.id === req.session.user.id) {
        return res.status(403).json({ message: "403: Wha-,, don't do that???"} )
    }

    user.setPermission(0)
    user.images.forEach((image) => {
        image.delete()
    })
    return res.status(200)
});

module.exports = router;