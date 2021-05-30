const multer = require('multer');
const uuid = require('uuid');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
};

// configure multer to store files.
const fileUpload = multer({
    limits: 500000, // upload limit is 500kb
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, 'uploads/images'); // run by multer to store file in destination we provide.
        },
        filename: (req, file, callback) => {
            const fileExtension = MIME_TYPE_MAP[file.mimetype];
            const fileName = uuid.v4() + '.' + fileExtension;
            callback(null, fileName); // run by multer to set whatever filename we provide.
        }
    }),
    fileFilter: (req, file, callback) => {
        const isValidFile = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValidFile ? null : new Error('Invalid mime type!');
        callback(error, isValidFile);
    }
});

module.exports = fileUpload;