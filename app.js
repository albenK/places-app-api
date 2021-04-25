const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

app.use('/api/places', placesRoutes); // => /api/places/...

/* Register an error middleware. This callback will run for any errors that have happened
    in previous middlewares. */
app.use((error, req, res, next) => {
    // if we've already sent a response, then just forward the error to the next middleware.
    if (res.headerSent) {
        return next(error);
    }
    // else, set the response status and send json.
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!'});
});

app.listen(5000);