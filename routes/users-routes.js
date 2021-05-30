const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middlewares/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);

/* When user signs up, we upload image file (user avatar) via middleware from multer.
If an error occurs while signing up, we need to delete the image. Delete logic happens in app.js's
error middleware.*/
router.post('/signup',
    fileUpload.single('image'),
    [
        check('name').not().isEmpty(),
        check('email')
            .normalizeEmail() // Test@test.com => test@test.com
            .isEmail(),
        check('password').isLength({ min: 6 })
    ],
    usersController.signUp
);

router.post('/login', usersController.signIn);


module.exports = router;