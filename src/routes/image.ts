import express from 'express';
import formidable from 'formidable';
import { Image } from '../types.js';
const router = express.Router();

router.post('/submit', async function(req, res, next) {
    const form = formidable.formidable({maxFiles: 0, maxFileSize: 50*10^6});
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return
        }
        if (!req.session.user) {
            return res.status(401).json({ message: '401: Unauthorized' })
        }
        if (!files.image || !files.image[0] || !fields.cost || !fields.cost[0] || !fields.title || !fields.title[0]) {
            return res.status(400).json({ message: '400: Bad request' })
        }

        const path = files.image[0].filepath
        const cost = parseInt(fields.cost[0])
        const title = fields.title[0]
        const description = fields.description ? fields.description[0] || "" : ""
        const tags = JSON.parse(fields.tags ? fields.tags[0] || "" : "")

        const image = Image.new(path, cost, req.session.user.id, title, description, tags)
        return res.status(200).json(image)
    });
})

router.get(':id', async function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    return res.json(image)
})

router.get(':id/preview', async function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    return res.sendFile(`images/preview/${image.id}.jpeg`)
})

router.get(':id/purchase', async function(_req, res) {
    return res.status(501).json({ message: "501: Not implemented" })
})

router.get(':id/download', async function(_req, res) {
    return res.status(501).json({ message: "501: Not implemented" })
})

router.patch(':id', async function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    const user = req.session.user
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    if (!user || user.permission !== 2 || user.id !== image.authorid) {
        return res.status(401).json({ message: '401: Unauthorized' })
    }

    image.modify({
        cost: req.body.cost,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
    })
    return res.json(image)
})

router.delete(':id', async function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    const user = req.session.user
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    if (!user || user.permission !== 2 || user.id !== image.authorid) {
        return res.status(401).json({ message: '401: Unauthorized' })
    }

    image.delete()
    return res.status(200)
})

router.patch(':id', async function(req, res) {
    const image = Image.get(parseInt(req.params.id))
    const user = req.session.user
    if (!image) {
        return res.status(404).json({ message: '404: Not found' })
    }
    if (!user || user.permission !== 2) {
        return res.status(401).json({ message: '401: Unauthorized' })
    }

    image.modify({ status: true })
    return res.json(image)
})

module.exports = router;