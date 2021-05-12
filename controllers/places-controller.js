const uuid = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsFromAddress = require('../utils/location');
const Place = require('../models/place');

// TODO: Delete once database is implemented.
let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous skyscrapers in the world',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Empire_State_Building_from_the_Top_of_the_Rock.jpg/220px-Empire_State_Building_from_the_Top_of_the_Rock.jpg',
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u1',
        location: {lat: 40.7484405, lng: -73.9878531}
    
    },
    {
        id: 'p2',
        title: 'Empire State Building with id p2',
        description: 'One of the most famous p2 skyscrapers in the world',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Empire_State_Building_from_the_Top_of_the_Rock.jpg/220px-Empire_State_Building_from_the_Top_of_the_Rock.jpg',
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u2',
        location: {lat: 40.7484405, lng: -73.9878531}
    }
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.placeId;
    const place = DUMMY_PLACES.find(p => p.id === placeId);

    if (!place) {
        const error = new HttpError('Could not find a place for the provided place id.', 404);
        throw error;
    }

    res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.userId;
    const places = DUMMY_PLACES.filter(p => p.creator === userId);

    if (!places || places.length === 0) {
        const error = new HttpError('Could not find places for the provided user id.', 404);
        return next(error);
    }

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

const updatePlace = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed. Please check your data.', 422);
    }
    const placeId = req.params.placeId;
    const place = DUMMY_PLACES.find(p => p.id === placeId);

    if (!place) {
        const error = new HttpError('Cannot update a place that doesn\'t exist', 404);
        return next(error);
    }
    const copyOfPlace = { ...place };
    const { title, description } = req.body;
    copyOfPlace.title = title;
    copyOfPlace.description = description;
    const index = DUMMY_PLACES.findIndex(p => p.id === placeId);

    DUMMY_PLACES[index] = copyOfPlace;

    res.status(200).json({ place: copyOfPlace });
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.placeId;

    const placeToDelete = DUMMY_PLACES.find(p => p.id === placeId);
    if (!placeToDelete) {
        throw new HttpError('Could not find a place with that id.', 404);
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;