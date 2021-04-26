const uuid = require('uuid');
const HttpError = require('../models/http-error');

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

const createPlace = (req, res, next) => {
    const { title, description, coordinates, address, creator } = req.body;
    // TODO: Validate the body properties before creating a new place.
    const newPlace = {
        id: uuid.v4(),
        title,
        description,
        location: coordinates,
        address,
        creator
    };
    // TODO: Replace with MongoDB logic later.
    DUMMY_PLACES.push(newPlace);

    res.status(201).json({ place: newPlace });
};

const updatePlace = (req, res, next) => {
    const placeId = req.params.placeId;
    const place = DUMMY_PLACES.find(p => p.id === placeId);

    if (!place) {
        const error = new HttpError('Cannot update a place that doesn\'t exist', 404);
        return next(error);
    }
    const copyOfPlace = { ...place };
    const { title, description } = req.body;
    // TODO: Validate the body properties before updating the place.
    copyOfPlace.title = title;
    copyOfPlace.description = description;
    const index = DUMMY_PLACES.findIndex(p => p.id === placeId);

    DUMMY_PLACES[index] = copyOfPlace;

    res.status(200).json({ place: copyOfPlace });
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.placeId;
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;