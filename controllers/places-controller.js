const uuid = require('uuid');
const HttpError = require('../models/http-error');
const DUMMY_PLACES = require('../dummy-places');

const getPlaceById = (req, res, next) => {
    const placeId = req.params.placeId;
    const place = DUMMY_PLACES.find(p => p.id === placeId);

    if (!place) {
        const error = new HttpError('Could not find a place for the provided place id.', 404);
        throw error;
    }

    res.json({place});
};

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.userId;
    const place = DUMMY_PLACES.find(p => p.creator === userId);

    if (!place) {
        const error = new HttpError('Could not find a place for the provided user id.', 404);
        return next(error);
    }

    res.json({place});
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

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;