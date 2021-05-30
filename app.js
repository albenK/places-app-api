const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const environmentVars = require('./environment');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');


const app = express();

/* Register middleware for body-parser. This will parse a request's body as json.*/
app.use(bodyParser.json());

/* Register middleware for allowing image requests */
app.use('/uploads/images/',
    express.static(
        path.join('uploads', 'images')
    )
);

/* Register middleware for CORS*/
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next()
});

app.use('/api/places', placesRoutes); // => /api/places/...
app.use('/api/users', usersRoutes); // => /api/users/...

/* Register middleware to detect unknown path. */
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

/* Register an error middleware. This callback will run for any errors that have happened
    in previous middlewares. */
app.use((error, req, res, next) => {
    /* If we have an error, we need to remove the uploaded file.
    Multer adds a "file" prop to the request. So we can check for that.*/
    if (req.file) {
        // Delete the file.
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    // if we've already sent a response, then just forward the error to the next middleware.
    if (res.headerSent) {
        return next(error);
    }
    // else, set the response status and send json.
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!'});
});

mongoose.connect(environmentVars.DB_URL, { useNewUrlParser: true})
.then(() => {
    app.listen(5000);
})
.catch((error) => {
    console.log(error);
});