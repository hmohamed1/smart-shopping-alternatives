const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio'); // Keep for helpers if needed
const puppeteer = require('puppeteer');
const upload = require('../config/multerConfig'); // Multer configuration
// Import both functions from aiService
const { findAlternativesWithAI, extractDetailsWithAI } = require('../services/aiService');

const router = express.Router();

// POST /api/find-by-url
router.post('/find-by-url', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required.' });
    console.log(`Received URL: ${url}`);

    let extractedData = {};
    let browser = null;
    let scrapingSuccess = false;

    try {
        // Try scraping with Puppeteer first
        console.log('[Scrape Original] Launching Puppeteer...');
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        // Using the original timeout and evaluate logic
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
        console.log('[Scrape Original] Page loaded.');

        extractedData = await page.evaluate((pageUrl) => {
            // Original page.evaluate logic (before enhancements)
             let productName = document.querySelector('#productTitle, h1[class*="title"], [itemprop="name"]')?.textContent.trim();
             if (!productName) productName = document.querySelector('title')?.textContent.trim();

             let productPrice = null;
             const priceSelectors = [
                 '#priceblock_ourprice', '#priceblock_dealprice', '.a-price .a-offscreen',
                 '[itemprop="price"]', 'meta[property="product:price:amount"]', 'meta[property="og:price:amount"]'
             ];
             for (const selector of priceSelectors) {
                 const element = document.querySelector(selector);
                 if (element) {
                     productPrice = selector.startsWith('meta') ? element.getAttribute('content') : element.textContent.trim();
                     break;
                 }
             }
             let numericPrice = null;
             if (productPrice) {
                 const cleanedPrice = productPrice.replace(/[\$£€,]/g, '').trim();
                 const parsed = parseFloat(cleanedPrice);
                 if (!isNaN(parsed)) numericPrice = parsed;
             }

             let description = document.querySelector('#productDescription, [itemprop="description"], .product-description')?.textContent.trim();
             if (!description) description = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim();

             let category = null;
             const breadcrumbs = Array.from(document.querySelectorAll('#wayfinding-breadcrumbs_feature_div ul a, .a-breadcrumb li a, nav[aria-label="breadcrumb"] ol li a'));
             if (breadcrumbs.length > 0) category = breadcrumbs[breadcrumbs.length - 1]?.textContent.trim();
             if (!category) category = document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',')[0]?.trim();
             if (!category || category.toLowerCase() === 'unknown') {
                  const lowerName = (productName || '').toLowerCase();
                  if (lowerName.includes('tv') || lowerName.includes('television')) category = 'Televisions';
                  else if (lowerName.includes('phone') || lowerName.includes('mobile')) category = 'Mobile Phones';
                  else if (lowerName.includes('laptop') || lowerName.includes('notebook')) category = 'Laptops';
                  else if (lowerName.includes('headphone') || lowerName.includes('earbud')) category = 'Headphones';
              }

             let imageUrl = document.querySelector('#landingImage, #mainImage img, [itemprop="image"]')?.getAttribute('src') || document.querySelector('meta[property="og:image"]')?.getAttribute('content');
             if (imageUrl && !imageUrl.startsWith('http')) {
                 try {
                     imageUrl = new URL(imageUrl, pageUrl).href;
                 } catch { imageUrl = null; }
             }

             return {
                 name: productName || 'Name not found',
                 price: numericPrice,
                 description: description || null,
                 category: category || null,
                 imageUrl: imageUrl || null,
                 url: pageUrl // Use the final URL after redirects
             };
        }, url);

        await browser.close();
        browser = null;
        scrapingSuccess = true; // Mark scraping as successful
        console.log('[Scrape Original] Puppeteer closed successfully.');

    } catch (scrapeError) {
        console.error(`[Scrape Original] Puppeteer failed for ${url}: ${scrapeError.message}. Falling back to AI extraction.`);
        if (browser) await browser.close(); // Ensure browser is closed on error
        scrapingSuccess = false; // Mark scraping as failed
    }

    // --- Fallback to AI Extraction if Puppeteer failed ---
    if (!scrapingSuccess) {
        console.log('[AI Fallback] Attempting AI detail extraction...');
        extractedData = await extractDetailsWithAI(url);

        if (!extractedData) {
            // If AI fallback also fails, return an error
            console.error(`[AI Fallback] AI extraction also failed for ${url}.`);
            return res.status(500).json({ error: 'Failed to extract product details using scraping and AI.' });
        }
        console.log('[AI Fallback] Successfully extracted details via AI.');
        // Ensure essential fields exist even if AI returns partial data
        extractedData = {
             name: extractedData.name || 'Name not found (AI)',
             price: extractedData.price || null,
             description: extractedData.description || null,
             category: extractedData.category || null,
             imageUrl: extractedData.imageUrl || null,
             url: url // Keep the original input URL
         };
    }

    // --- Proceed with finding alternatives using the extracted data ---
    try {
        console.log('Extracted Data (Final):', extractedData);
        const alternatives = await findAlternativesWithAI(extractedData);

        res.json({
            message: alternatives.length > 0 ? 'Alternatives found.' : 'No cheaper alternatives found.',
            originalProduct: extractedData,
            alternatives: alternatives
        });
    } catch (aiError) {
         console.error(`Error finding alternatives for ${url}:`, aiError);
         res.status(500).json({ error: 'Failed to find alternatives due to an internal server error.' });
    }
});

// POST /api/find-by-image
router.post('/find-by-image', upload.single('productImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image file is required.' });
    }

    console.log(`Received image: ${req.file.originalname}, size: ${req.file.size} bytes`);
    const imageBuffer = req.file.buffer;
    const imageMimeType = req.file.mimetype;

    try {
        // Re-import AI model here as it might be null if key was missing initially
        const { model: aiModel, generationConfig, safetySettings } = require('../config/aiConfig');
        if (!aiModel) {
             return res.status(500).json({ error: "AI functionality disabled: API key not configured." });
        }

        console.log("Processing image with Gemini Vision...");
        const imageBase64 = imageBuffer.toString('base64');
        const imagePart = { inlineData: { data: imageBase64, mimeType: imageMimeType } };

        const visionPrompt = `
            Analyze the product shown in this image. Identify the following:
            1.  **Product Name:** The specific name or model if identifiable (e.g., "Nike Air Zoom Pegasus 39", "Keurig K-Mini Coffee Maker"). If not specific, use a descriptive name (e.g., "Blue short-sleeve t-shirt").
            2.  **Product Category:** The general category (e.g., "Running Shoe", "Single-Serve Coffee Maker", "Clothing").
            3.  **Key Features/Description:** A brief description highlighting important visual characteristics (e.g., "Black and white colorway, mesh upper", "Compact design, available in multiple colors", "Cotton blend, crew neck, small logo on chest").

            Return the result as a single JSON object with the keys "name", "category", and "description". Example:
            { "name": "Example Product Name", "category": "Example Category", "description": "Example key features description." }
        `;

        const visionResult = await aiModel.generateContent([visionPrompt, imagePart], generationConfig, safetySettings);
        const visionResponseText = visionResult.response.text();
        console.log("Gemini Vision Response Text:", visionResponseText);

        let productInfoFromImage;
        try {
            productInfoFromImage = JSON.parse(visionResponseText);
            if (!productInfoFromImage || typeof productInfoFromImage !== 'object' || !productInfoFromImage.name) {
                 throw new Error("Vision AI response was not valid JSON or missing required fields.");
            }
            productInfoFromImage.price = null;
            productInfoFromImage.imageUrl = `data:${imageMimeType};base64,${imageBase64}`;
            productInfoFromImage.url = null;
        } catch (parseError) {
            console.error("Error parsing Vision AI response:", parseError);
            productInfoFromImage = {
                name: "Product identified (details unclear)", category: "Unknown",
                description: visionResponseText.substring(0, 200), price: null,
                imageUrl: `data:${imageMimeType};base64,${imageBase64}`, url: null
            };
        }

        console.log('Product Info from Image Analysis:', productInfoFromImage);
        const alternatives = await findAlternativesWithAI(productInfoFromImage);

        res.json({
            message: alternatives.length > 0 ? 'Alternatives found.' : 'No cheaper alternatives found for the product in the image.',
            originalProduct: productInfoFromImage,
            alternatives: alternatives
        });

    } catch (error) {
        console.error('Error processing image:', error);
        if (error instanceof multer.MulterError) {
             return res.status(400).json({ error: `File upload error: ${error.message}` });
        }
        res.status(500).json({ error: 'Failed to process image.' });
    }
});

module.exports = router;
