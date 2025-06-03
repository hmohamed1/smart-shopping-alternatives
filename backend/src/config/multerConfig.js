const multer = require('multer');

// Configure storage - using memory storage for simplicity
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size (e.g., 10MB)
    fileFilter: (req, file, cb) => {
        // Accept only common image types
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
            cb(null, true);
        } else {
            // Reject file with a specific error message
            cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
        }
    }
});

module.exports = upload;
