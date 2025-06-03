require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Required for error handling instance check

// Import routes
const productRoutes = require('./src/routes/productRoutes');

// --- Basic Setup ---
const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// --- API Routes ---
// Mount the product routes under the /api path
app.use('/api', productRoutes);

// --- Global Error Handler ---
// Needs to be defined after routes
app.use((err, req, res, next) => {
    console.error("Global Error Handler Caught:");
    console.error(err); // Log the full error

    // Handle specific Multer errors (e.g., file size, file type)
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `File upload error: ${err.message}` });
    }
    // Handle specific file type errors from our custom filter
    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({ error: err.message });
    }

    // Generic error response
    res.status(500).json({ error: 'Something went wrong on the server!' });
});


// --- Start Server ---
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    if (!process.env.GEMINI_API_KEY) {
         console.warn("Warning: GEMINI_API_KEY environment variable is not set. AI features will be disabled.");
    }
});
