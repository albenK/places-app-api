const express = require('express');

const DUMMY_PLACES = require('../dummy-places');
const router = express.Router();

router.get('/', (req, res, next) => {
    console.log('GET Request in users');
    res.json({message: 'It works'});
});

module.exports = router;