const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/places-controller');
const fileUpload = require('../middlewares/file-upload');
const CHECK_AUTH = require('../middlewares/check-auth');

const router = express.Router();

router.get('/:placeId', placesController.getPlaceById);

router.get('/user/:userId', placesController.getPlacesByUserId);

/* Register middleware for the controllers below. We can only create, update and delete a place 
if a user is signed in.*/
router.use(CHECK_AUTH);

/* When we create a place, we upload image file (place image) via middleware from multer.
If an error occurs while creating this place, we need to delete the image. Delete logic happens in app.js's
error middleware.*/
router.post('/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty()
    ],
    placesController.createPlace
);

router.patch('/:placeId',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    placesController.updatePlace
);

router.delete('/:placeId', placesController.deletePlace);


module.exports = router;