const jwt = require('jsonwebtoken');
const environmentVars = require('../environment');
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    /* Browser sends an OPTIONS request for POST, PATCH and DELETE. We need to check for this
    and skip to the next middleware.*/
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        // req.headers.authorization should be 'Bearer TOKEN'. So we need to split it and retrieve the first index.
        const token = req.headers.authorization.split(' ')[1];
    
        if (!token) {
            throw new Error('Authentication failed!');
        }

        // Verify the token
        const payload = jwt.verify(token, environmentVars.JWT_PRIVATE_KEY);
        // Attach a "userData" key to the request and forward to next middleware.
        req.userData = { userId: payload.userId };
        next();
    } catch (err) {
        const e = new HttpError('Authentication failed!', 403);
        return next(e);
    }
};