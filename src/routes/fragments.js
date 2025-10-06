const express = require('express');
const contentType = require('content-type');
const Fragment = require('../model/fragment');
const basicAuth = require('../auth/basic-auth'); // default for tests/dev
const cognitoAuth = require('../auth/cognito'); // production bearer

const router = express.Router();

/**
 * For the purposes of the assignment, allow configuration of auth type via ENV:
 *   AUTH_STRATEGY=basic   -> use basic auth
 *   AUTH_STRATEGY=bearer  -> use bearer/cognito
 * default: basic
 */
const authStrategy = process.env.AUTH_STRATEGY === 'bearer' ? cognitoAuth : basicAuth;

// router.use(authStrategy().bind ? authStrategy() : authStrategy); // call returned middleware
router.use(authStrategy.authenticate());

// raw body parser only for supported types
const rawBody = () =>
    express.raw({
        inflate: true,
        limit: '5mb',
        type: (req) => {
            try {
                const { type } = contentType.parse(req);
                return Fragment.isSupportedType(type);
            } catch (e) {
                return false;
            }
        },
    });

// POST /v1/fragments
router.post('/fragments', rawBody(), async (req, res, next) => {
    try {
        if (!Buffer.isBuffer(req.body)) {
            return res.status(415).json({ error: 'Unsupported Media Type' });
        }
        const ct = contentType.parse(req).type;
        const fragment = await Fragment.create(req.user.ownerId, ct, req.body);
        const base = process.env.API_URL || `http://${req.headers.host}`;
        res.set('Location', `${base}/v1/fragments/${fragment.id}`);
        res.status(201).json(fragment);
    } catch (err) {
        next(err);
    }
});

// GET /v1/fragments -> list fragment ids
router.get('/fragments', async (req, res, next) => {
    try {
        const ids = await Fragment.list(req.user.ownerId);
        res.json({ fragments: ids });
    } catch (err) {
        next(err);
    }
});

// GET /v1/fragments/:id -> metadata
router.get('/fragments/:id', async (req, res, next) => {
    try {
        const meta = await Fragment.read(req.user.ownerId, req.params.id);
        res.json(meta);
    } catch (err) {
        next(err);
    }
});

// GET /v1/fragments/:id/data -> raw data
router.get('/fragments/:id/data', async (req, res, next) => {
    try {
        const ownerId = req.user.ownerId;
        const { id } = req.params;

        const frag = await Fragment.byId(ownerId, id);
        if (!frag) return res.status(404).send('Fragment not found');

        const dataBuffer = await Fragment.readData(ownerId, id);

        // explicitly set Content-Type to exactly 'text/plain'
        res.setHeader('Content-Type', frag.mimeType);
        res.send(dataBuffer);
    } catch (err) {
        next(err);
    }
});



module.exports = router;
