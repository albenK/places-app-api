const uuid = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Foo Bar',
        email: 'test@test.com',
        password: 'abc123'
    }
];

const getUsers = (req, res, next) => {
    res.status(200).json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed. Please check your data.', 422);
    }
    const { name, email, password } = req.body;

    const emailExists = DUMMY_USERS.find(u => u.email === email);

    if (emailExists) {
        throw new HttpError('Could not register user. Email already exists.', 422);
    }

    const newUser = {
        id: uuid.v4(),
        name,
        email,
        password
    };

    DUMMY_USERS.push(newUser);

    res.status(201).json({ user: newUser });
};

const signIn = (req, res, next) => {
    const { email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find(u => u.email === email);

    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify user. Credentials seem to be wrong.', 401);
    }

    res.json({ message: 'Logged in' });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.signIn = signIn;