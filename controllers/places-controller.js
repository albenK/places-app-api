const uuid = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsFromAddress = require('../utils/location');
const Place = require('../models/place');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;
    let place;

    try {
        place = await Place.findById(placeId);
    } catch(error) {
        const httpError = new HttpError('Something went wrong. Please try again later.', 500);
        return next(httpError);
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided place id.', 404);
        return next(error);
    }
    // Retrieve the id prop with toObject({getters: true})
    res.json({ place: place.toObject({ getters: true })});
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    let places;

    try {
        places = await Place.find({ creator: userId });
    } catch(error) {
        const httpError = new HttpError('Something went wrong. Please try again later.', 500);
        return next(httpError);
    }

    if (!places || places.length === 0) {
        const error = new HttpError('Could not find places for the provided user id.', 404);
        return next(error);
    }

    // Retrieve the id prop with toObject({getters: true})
    places = places.map(p => p.toObject({ getters: true }));

    res.json({ places });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed. Please check your data.', 422);
        return next(error);
    }

    const { title, description, address, creator } = req.body;
    let coordinates;
    try {
        coordinates = await getCoordsFromAddress(address);
    } catch (error) {
        return next(error);
    }
    
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Empire_State_Building%2C_New_York%2C_NY.jpg',
        creator
    });
    
    try {
        await createdPlace.save();
    } catch (error) {
        const httpError = new HttpError('Creating place failed. Please try again', 500);
        return next(httpError);
    }

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationError = new HttpError('Invalid inputs passed. Please check your data.', 422);
        return next(validationError);
    }
    const placeId = req.params.placeId;
    let place;
    
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        const httpError = new HttpError('Something went wrong. Could not update place.', 500);
        return next(httpError);
    }

    if (!place) {
        const error = new HttpError('Cannot update a place that doesn\'t exist', 404);
        return next(error);
    }

    const { title, description } = req.body;

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (error) {
        const e = new HttpError('Something went wrong. Could not update place.', 500);
        return next(e);
    }

    res.status(200).json({ place: place.toObject({ getters: true })});
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.placeId;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (error) {
        const httpError = new HttpError('Something went wrong. Could not delete place.', 500);
        return next(httpError);
    }

    try {
        await place.remove();
    } catch (error) {
        const httpError = new HttpError('Something went wrong. Could not delete place.', 500);
        return next(httpError);
    }

    res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;