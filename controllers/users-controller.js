const uuid = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
    let users;

    try {
        // Don't include the password field.
        users = await User.find({}, '-password');
    } catch (error) {
        return next(
            new HttpError('Fetching users failed. Please try again later.', 500)
        );
    }

    users = users.map(u => u.toObject({ getters: true }));

    res.status(200).json({ users });
};

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return next(
           new HttpError('Invalid inputs passed. Please check your data.', 422)
        );
    }
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (error) {
        const httpError = new HttpError('Signing up failed. Please try again later.', 500);
        return next(httpError);
    }

    if (existingUser) { // if user with provided email exists.
        const error = new HttpError('Provided email exists.', 422);
        return next(error);
    }


    const newUser = new User({
        name,
        email,
        image: 'https://image.flaticon.com/icons/png/128/149/149071.png',
        password,
        places: 'p1'
    });

    // save user to DB
    try {
        await newUser.save(); 
    } catch (error) {
        const e = new HttpError('An error occurred while creating your account. Please try again later.', 500);
        return next(e);
    }

    // TODO: Remove password from the response.
    res.status(201).json({ user: newUser.toObject({ getters: true })});
};

const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (error) {
        const httpError = new HttpError('Logging in failed. Please try again later.', 500);
        return next(httpError);
    }

    // TODO: Check hashed password.
    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials. Could not log you in.', 401);
        return next(error);
    }

    res.json({ message: 'Logged in' });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.signIn = signIn;