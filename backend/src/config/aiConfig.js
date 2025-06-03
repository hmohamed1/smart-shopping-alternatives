const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not set in the environment variables.");
}

let genAI;
let model;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    // Model initialization (grounding config removed from here)
    model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash", // Ensure this model supports grounding
    });
} else {
    console.warn("AI functionality will be limited or disabled due to missing API key.");
    genAI = null;
    model = null;
}

// Add enableGrounding to generationConfig
const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192
    // responseMimeType: "application/json" // REMOVED: Cannot be used with grounding tools
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

module.exports = {
    apiKey,
    model,
    generationConfig,
    safetySettings
};
