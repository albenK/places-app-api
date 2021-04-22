const express = require('express');
const DUMMY_PLACES = require('../dummy-places');

const router = express.Router();

router.get('/:placeId', (req, res, next) => {
    const placeId = req.params.placeId;
    const place = DUMMY_PLACES.find(p => p.id === placeId);
    res.json({place});
});

router.get('/user/:userId', (req, res, next) => {
    const userId = req.params.userId;
    const place = DUMMY_PLACES.find(p => p.creator === userId);
    res.json({place});
});

module.exports = router;