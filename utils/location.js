const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = 'pk.cea5cf1b60e54abff724cfe24f788ac5';

const getCoordsFromAddress = async (address) => {
    const url = `https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${encodeURIComponent(address)}&format=json`;
    const response = await axios.get(url);

    const addressData = response.data[0];

    if (!addressData || !addressData.lat || !addressData.lon) {
        const error = new HttpError('Could not find location for the specified address.', 422);
        throw error;
    }

    const coordinates = {
        lat: parseFloat(addressData.lat),
        lng: parseFloat(addressData.lon)
    };

    return coordinates;
};

module.exports = getCoordsFromAddress;