const express = require('express');
const DUMMY_PLACES = require('../dummy-places');

const HttpError = require('../models/http-error');

const router = express.Router();

router.get('/:placeId', (req, res, next) => {
    const placeId = req.params.placeId;
    const place = DUMMY_PLACES.find(p => p.id === placeId);

    if (!place) {
        const error = new HttpError('Could not find a place for the provided place id.', 404);
        throw error;
    }

    res.json({place});
});

router.get('/user/:userId', (req, res, next) => {
    const userId = req.params.userId;
    const place = DUMMY_PLACES.find(p => p.creator === userId);

    if (!place) {
        const error = new HttpError('Could not find a place for the provided user id.', 404);
        return next(error);
    }

    res.json({place});
});

module.exports = router;