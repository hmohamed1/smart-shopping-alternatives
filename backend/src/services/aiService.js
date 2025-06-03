const { model, generationConfig, safetySettings, apiKey } = require('../config/aiConfig');
const { validateProductUrl, scrapeImageUrlFromPage, isRelevantAlternative } = require('../utils/validationHelpers');

// Helper Function for AI Interaction (incorporating validation, relevance, image scraping)
async function findAlternativesWithAI(productInfo) {
    if (!model) { // Check if the model was initialized (API key might be missing)
        console.warn("AI model not available. Skipping AI search.");
        return [];
    }
    const { name, price, description, category, imageUrl: originalImageUrl } = productInfo;

    const taskDescription = (typeof price === 'number' && !isNaN(price))
        ? `find similar products available for purchase online that are CHEAPER than the original price ($${price}). Focus on finding cheaper options with valid product page URLs.`
        : `find similar products available for purchase online. Since the original price is unknown, focus on similarity rather than price comparison. Focus on finding options with valid product page URLs.`;

    const prompt = `
        Analyze the following product:
        Name: ${name || 'Unknown'}
        Price: ${typeof price === 'number' ? `$${price}` : 'Unknown'}
        ${description ? `Description: ${description}` : ''}
        ${category ? `Category: ${category}` : ''}
        ${originalImageUrl ? `Original Image URL: ${originalImageUrl}` : ''}

        Your task is to ${taskDescription}
        CRITICAL:
        - The product is a ${category || 'product type indicated by name/description'}. Alternatives MUST be of the SAME product type (e.g., if the original is a TV, alternatives must also be TVs, not doorbells or streaming devices).
        - Focus on finding alternatives that closely match the original product's TYPE and KEY FEATURES (e.g., screen size, display technology like QLED/OLED, 4K resolution, HDR support).
        - Each alternative's "name", "description", "url", and "imageUrl" MUST correspond to the SAME product. The "imageUrl" must be a direct link to an image that accurately depicts the product described in "name" and "description". If you cannot find an accurate image URL or are unsure, set the "imageUrl" field to null.
        - Only include products from reputable online retailers (e.g., Amazon, Walmart, Best Buy, Target).
        - Ensure each "url" links to an ACTIVE product page that is currently available for purchase.
        - If no relevant alternatives are found, return an empty array.

        Return the results strictly as a JSON array of objects. Each object in the array should represent one alternative product and have ONLY the following structure:
        {
          "name": "Product Name",
          "description": "Brief description of the alternative",
          "price": "Estimated price as a number (e.g., 149.99, or null if unknown)",
          "source": "Website/Vendor Name (e.g., Amazon, Walmart.com)",
          "url": "Direct URL to the actual product page for the alternative.",
          "imageUrl": "Direct URL to a publicly accessible image that ACCURATELY REPRESENTS the product described by the name and description. If unavailable or uncertain, set this field to null."
        }

        CRITICAL ADDITIONS:
        - Use real-time Google Search data to verify product availability, pricing, and URLs.
        - Prioritize results based on recent information (e.g., past 6 months if possible).
        - Ensure source attributions are accurate based on search results.

        Provide up to 5 valid alternatives. Return only the JSON array. Do not include markdown formatting or triple backticks.
    `;

    try {
        console.log("Sending request to Gemini AI...");
        const chatSession = model.startChat({
            generationConfig,
            safetySettings,
            history: [],
            // Pass tools config here for grounding (Corrected field name)
            tools: [{ google_search: {} }]
        });

        // Pass the prompt and potentially adjust how sendMessage is called if needed for tools
        // The exact method might vary slightly based on SDK version when using tools.
        // Assuming standard sendMessage works, but might need adjustment like `sendMessage({ prompt, tools: [...] })`
        const result = await chatSession.sendMessage(prompt);
        const response = result.response; // Get the full response object
        const responseText = response.text();
        console.log("Gemini AI Response Text:", responseText);

        // --- Handle Grounding Citations ---
        // Note: The exact property name might be different (e.g., groundingMetadata, citations) - check SDK docs
        const citations = response.citations || response.groundingMetadata?.citations || [];
        if (citations.length > 0) {
             console.log(`Grounding Citations Received (${citations.length}):`);
             citations.forEach((citation, i) => {
                 console.log(`  Citation ${i + 1}:`);
                 console.log(`    Source URI: ${citation.sourceId || citation.uri || 'N/A'}`);
                 // Log other citation details if available and needed (e.g., startIndex, endIndex, license)
             });
        } else {
             console.log("No grounding citations found in the response.");
        }
        // --- End Grounding Citation Handling ---


        let parsedJson = null;
        try {
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
            if (jsonMatch) {
                const jsonString = jsonMatch[1] || jsonMatch[2];
                parsedJson = JSON.parse(jsonString);
            } else {
                parsedJson = JSON.parse(responseText);
            }
        } catch (parseError) {
            console.error("Error parsing JSON response from AI:", parseError);
            return [];
        }

        if (!Array.isArray(parsedJson)) {
            console.error("Extracted content was not a valid JSON array.", parsedJson);
            return [];
        }

        const validatedAlternatives = parsedJson.filter(alt => {
             if (!alt || typeof alt !== 'object' || !alt.name || typeof alt.name !== 'string' || !alt.name.trim() || !alt.url || typeof alt.url !== 'string' || !alt.url.trim()) {
                 console.warn("Filtering out item with missing/invalid basic fields:", alt);
                 return false;
             }
             return true;
         });

        const processedAlternatives = validatedAlternatives.map(alt => {
            let numericPrice = null;
            if (alt.price !== undefined && alt.price !== null) {
                const priceStr = String(alt.price);
                const cleanedPrice = priceStr.replace(/[\$£€,]/g, '').trim();
                if (cleanedPrice !== '' && !isNaN(cleanedPrice)) {
                    const parsed = parseFloat(cleanedPrice);
                    if (!isNaN(parsed)) numericPrice = parsed;
                }
            }
            return { ...alt, price: numericPrice };
        });

        const relevantAlternatives = processedAlternatives.filter(alt => {
            const isRelevant = isRelevantAlternative(category, productInfo, alt);
            if (!isRelevant) console.warn(`Filtering out irrelevant alternative: ${alt.name}`);
            return isRelevant;
        });

        console.log(`Validating ${relevantAlternatives.length} potential alternative URLs and scraping images...`);
        const validatedAndEnrichedAlternatives = await Promise.all(
            relevantAlternatives.map(async (alt) => {
                const isValid = await validateProductUrl(alt.url);
                if (isValid) {
                    const scrapedImageUrl = await scrapeImageUrlFromPage(alt.url);
                    const finalImageUrl = scrapedImageUrl || alt.imageUrl; // Prioritize scraped image
                    return { ...alt, imageUrl: finalImageUrl };
                } else {
                    return null;
                }
            })
        );

        const finalAlternatives = validatedAndEnrichedAlternatives.filter(alt => alt !== null);

        console.log(`Found ${finalAlternatives.length} valid alternatives after validation and image scraping.`);
        return finalAlternatives.slice(0, 5);

    } catch (error) {
        console.error("Error during Gemini AI interaction or processing:", error);
        // Check for specific safety blocks or other API errors
        if (error.response && error.response.promptFeedback) {
            console.error("AI Safety Feedback:", error.response.promptFeedback);
        }
        return []; // Return empty array on overarching errors
    }
}

// --- Helper Function to Extract Product Details via AI ---
async function extractDetailsWithAI(url) {
    if (!model) {
        console.warn("AI model not available. Skipping AI detail extraction.");
        return null;
    }

    const prompt = `
        Analyze the content of the following product page URL: ${url}

        Extract the following details and return them ONLY as a single JSON object with the specified keys. If a detail cannot be reliably determined, set its value to null.
        Structure:
        {
          "name": "Product Name (string or null)",
          "price": "Estimated price as a number (e.g., 149.99, or null if unknown)",
          "description": "Brief product description (string or null)",
          "category": "Product category (string or null, e.g., 'Televisions', 'Smartphones')",
          "imageUrl": "Direct URL to the main product image (string or null)"
        }

        CRITICAL: Use Google Search grounding to get the most accurate and current information from the URL. Return ONLY the JSON object, no extra text or markdown.
    `;

    try {
        console.log(`[AI Detail Extraction] Sending request for URL: ${url}`);
        // Use startChat and pass tools for grounding, similar to findAlternativesWithAI
        const chatSession = model.startChat({
            generationConfig: { ...generationConfig, responseMimeType: "application/json" }, // Request JSON directly for this specific task if possible
            safetySettings,
            history: [],
            tools: [{ google_search: {} }] // Enable grounding
        });

        const result = await chatSession.sendMessage(prompt);
        const response = result.response;
        const responseText = response.text();
        console.log("[AI Detail Extraction] Response Text:", responseText);

        // Handle potential grounding citations (optional logging)
        const citations = response.citations || response.groundingMetadata?.citations || [];
        if (citations.length > 0) console.log(`[AI Detail Extraction] Grounding Citations Received: ${citations.length}`);

        // Parse JSON
        let extractedData = JSON.parse(responseText);

        // Basic validation
        if (!extractedData || typeof extractedData !== 'object') {
            throw new Error("AI response was not a valid JSON object.");
        }

        // Ensure price is numeric or null
        if (extractedData.price !== undefined && extractedData.price !== null) {
            const priceStr = String(extractedData.price);
            const cleanedPrice = priceStr.replace(/[\$£€,]/g, '').trim();
            extractedData.price = (!isNaN(cleanedPrice) && cleanedPrice !== '') ? parseFloat(cleanedPrice) : null;
        } else {
            extractedData.price = null;
        }

        // Add the original URL back for consistency
        extractedData.url = url;

        console.log("[AI Detail Extraction] Successfully extracted:", extractedData);
        return extractedData;

    } catch (error) {
        console.error(`[AI Detail Extraction] Failed for URL ${url}:`, error);
        return null; // Return null on error
    }
}


module.exports = {
    findAlternativesWithAI,
    extractDetailsWithAI // Export the new function
};
