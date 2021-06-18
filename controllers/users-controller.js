const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // hash password using bcryptjs
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(
            new HttpError('Could not create your account. Please try again later.', 500)
        );
    }

    const newUser = new User({
        name,
        email,
        image: req.file.path, // should be "uploads/images/..."
        password: hashedPassword,
        places: []
    });

    // save user to DB
    try {
        await newUser.save(); 
    } catch (error) {
        const e = new HttpError('An error occurred while creating your account. Please try again later.', 500);
        return next(e);
    }

    // Create a token.
    let token;
    try {
        token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '1h'}
        );
    } catch (err) {
        const e = new HttpError('An error occurred while creating your account. Please try again later.', 500);
        return next(e);
    }

    res.status(201).json({ userId: newUser.id, email: newUser.email, token: token });
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

    if (!existingUser) {
        const error = new HttpError('Invalid credentials. Could not log you in.', 403);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('Could not log you in. Please check your credentials.', 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials. Could not log you in.', 401);
        return next(error);
    }

    // Create a token.
    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '1h'}
        );
    } catch (err) {
        const e = new HttpError('An error occurred while signing in. Please try again later.', 500);
        return next(e);
    }

    res.json({ userId: existingUser.id, email: existingUser.email, token: token });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.signIn = signIn;