import express from 'express';
import * as formidable from 'formidable';
import { Image } from '../types';
import db from "./../db";
import path from 'node:path';
import assert from 'node:assert';
const router = express.Router();

router.get('/', function(req, res) {
    const images: Array<Image> = []
    const limit = typeof req.query.limit == "string" ? parseInt(req.query.limit) : 50
    const offset = typeof req.query.offset == "string" ? parseInt(req.query.offset) : 0
    db.prepare('SELECT rowid FROM images WHERE approved = 1 ORDER BY timestamp LIMIT ? OFFSET ?')
        .all(limit, offset)
        .forEach(({rowid}) => {
            assert(typeof rowid === "number")
            const image = Image.get(rowid)
            assert(image)
            images.push(image)
        })
    return res.json(images)
})

router.get('/unapproved', function(_req, res) {
    const images: Array<Image> = []
    db.prepare('SELECT rowid FROM images WHERE approved = 0 ORDER BY timestamp')
        .all()
        .forEach(({rowid}) => {
            assert(typeof rowid === "number")
            const image = Image.get(rowid)
            assert(image)
            images.push(image)
        })
    return res.json(images)
})

router.post('/', async function(req, res, next) {
    const form = formidable.formidable({ maxFiles: 1, maxFileSize: 50*10**6 });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return next(err);
        }
        if (!req.session.user || req.session.user.permission < 1) {
            return res.status(401).json({ message: '401: Unauthorized' })
        }
        if (!files.image || !files.image[0] || !fields.cost || !fields.cost[0] || !fields.title || !fields.title[0]) {
            return res.status(400).json({ message: '400: Bad request' })
        }

        const path = files.image[0].filepath
        const cost = parseInt(fields.cost[0])
        const title = fields.title[0]
        const description = fields.description ? fields.description[0] || "" : ""
        const tags = JSON.parse(fields.tags ? fields.tags[0] || "[]" : "[]")

        const image = await Image.new(path, cost, req.session.user.id, title, description, tags)
        if (!image.sucess) {
            return res.status(500).json({ message: '500: Failed to save image' })
        }
        return res.json(image.image)
    });
})

router.get('/:id', function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    return res.json(image)
})

router.get('/:id/preview', function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    return res.sendFile(`images/preview/${image.id}.jpeg`, { root: path.join(__dirname, "../..") })
})

router.get('/:id/purchase', function(_req, res) {
    return res.status(501).json({ message: "501: Not implemented" })
})

router.get('/:id/download', function(_req, res) {
    return res.status(501).json({ message: "501: Not implemented" })
})

router.patch('/:id', function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    const user = req.session.user
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    if (!user || !(user.permission === 2 || user.id === image.authorid)) {
        return res.status(401).json({ message: '401: Unauthorized' })
    }

    if (user.permission !== 2) {
        image.modify({ approved: false })
    }

    image.modify({
        cost: req.body.cost,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
    })
    return res.json(image)
})

router.delete('/:id', function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    const user = req.session.user
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    if (!user || !(user.permission === 2 || user.id === image.authorid)) {
        return res.status(401).json({ message: '401: Unauthorized' })
    }

    image.delete()
    return res.status(200)
})

router.patch('/:id/approve', function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    const user = req.session.user
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    if (!user || user.permission !== 2) {
        return res.status(401).json({ message: '401: Unauthorized' })
    }

    image.modify({ approved: true })
    return res.json(image)
})

module.exports = router;