const fs = require('fs');

const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsFromAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');

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
        const httpError = new HttpError('Something went wrong with finding the place. Please try again later.', 500);
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
        return next(
            new HttpError('Address lookup failed. Please try again later.', 500)
        );
    }
    
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path, // should be "uploads/images/..."
        creator
    });
    
    // try and find a user with the provided user id (creator)
    let user;

    try {
        user = await User.findById(creator);
    } catch (error) {
        return next(
            new HttpError('Creator lookup failed. Please try again later.', 500)
        );
    }

    // If no user found, forward error to error handler.
    if (!user) {
        return next(
            new HttpError('Could not find user for provided user id.', 404)
        );
    }

    /* Start a new mongo DB session to save new place and save the place 
        id to user.places array. If anything goes wrong, MongoDB will rollback these changes.
        */
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        // NOTE: Need to make sure we have "places" collection in our DB. Else save won't work.
        await createdPlace.save({ session: session });
        user.places.push(createdPlace); // MongoDB will only add the place id.
        await user.save({ session: session });
        await session.commitTransaction(); // When this resolves, all changes are commited.
    } catch (error) {
        const httpError = new HttpError('Creating place failed. Please try again later.', 500);
        return next(httpError);
    }

    res.status(201).json({ place: createdPlace.toObject({ getters: true })});
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
        /* populate function will retrieve the creator and populate the "place.creator" prop
        with the user object. The populate function ONLY works because of the way we defined
        our Mongoose Schema. A Place has a creator prop which is a reference to a User. So populate
        function will populate the "creator" prop with the user object for us. This makes it possible to access User props.
        For example: "place.creator.places" or "place.creator.email"*/
        place = await Place.findById(placeId).populate('creator');
    } catch (error) {
        const httpError = new HttpError('Something went wrong with finding the place.', 500);
        return next(httpError);
    }

    if (!place) {
        const httpError = new HttpError('Could not find a place with the provided id.', 404);
        return next(httpError);
    }

    const imagePath = place.image;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.remove({ session: session });
        // MongoDB populates creator with the user object (User that created this place). This is because of the populate function from above.
        place.creator.places.pull(place); // MongoDB will remove this place (place id) from it's creators "places" array.
        await place.creator.save({ session: session }); // save the user
        await session.commitTransaction();
    } catch (error) {
        const httpError = new HttpError('Something went wrong with deleting this place. Please try again later', 500);
        return next(httpError);
    }

    // Delete the image for this place.
    fs.unlink(imagePath, (err) => {
        console.log(err);
    });

    res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;