const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const NodeCache = require('node-cache');

// --- Caches ---
const urlCache = new NodeCache({ stdTTL: 3600 }); // Cache URL validation results for 1 hour
const imageCache = new NodeCache({ stdTTL: 3600 }); // Cache scraped image URLs for 1 hour

// --- Helper Function to Validate Product URL ---
async function validateProductUrl(url) {
    const cachedResult = urlCache.get(url);
    if (cachedResult !== undefined) {
        console.log(`[URL Validation Cache Hit] URL: ${url}, Valid: ${cachedResult}`);
        return cachedResult;
    }

    if (!url || typeof url !== 'string' || (!url.startsWith('http:') && !url.startsWith('https:'))) {
        console.warn(`[URL Validation] Invalid URL format provided: ${url}`);
        urlCache.set(url, false);
        return false;
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 7000,
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400,
        });

        if (response.status !== 200) {
            console.warn(`[URL Validation] URL ${url} returned status ${response.status}`);
            urlCache.set(url, false);
            return false;
        }

        // Availability check is commented out due to unreliability
        console.log(`[URL Validation] Passed for: ${url} (Availability check skipped)`);
        urlCache.set(url, true);
        return true;

    } catch (error) {
        if (error.response) {
             console.warn(`[URL Validation] Failed for ${url}: Status ${error.response.status}`);
        } else if (error.request) {
             console.warn(`[URL Validation] Failed for ${url}: No response (Timeout/Network Error)`);
        } else {
             console.warn(`[URL Validation] Failed for ${url}: ${error.message}`);
        }
        urlCache.set(url, false);
        return false;
    }
}

// --- Helper Function to Scrape Image from a Validated URL (using Puppeteer) ---
async function scrapeImageUrlFromPage(url) {
    const cachedImage = imageCache.get(url);
    if (cachedImage !== undefined) {
        console.log(`[Image Scrape Cache Hit] URL: ${url}, Image: ${cachedImage}`);
        return cachedImage;
    }

    let browser = null;
    try {
        console.log(`[Image Scrape Puppeteer] Launching browser for ${url}`);
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        // Increase navigation timeout further
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 25000 }); // Increased to 25 seconds
        console.log(`[Image Scrape Puppeteer] Page loaded for ${url}`);

        const imageUrl = await page.evaluate(() => {
            // Prioritize Open Graph image
            let img = document.querySelector('meta[property="og:image"]');
            if (img && img.getAttribute('content')) return img.getAttribute('content');

            // Fallback to common product image selectors (Adjusted)
            const selectors = [
                '#main-image-container img', // Amazon main image
                '#landingImage',             // Amazon fallback
                '.product-image-gallery img', // Common gallery pattern
                '.product-image img',         // Generic product image class
                'img[itemprop="image"]',      // Schema.org markup
                '.gallery-image img',         // Another gallery pattern
                '#product-image img'          // Another ID pattern
            ];
            for (const selector of selectors) {
                 img = document.querySelector(selector);
                 // Check for src or data-src attributes
                 const src = img?.getAttribute('src') || img?.getAttribute('data-src');
                 if (img && src) return src;
            }
            return null;
        });

        await browser.close();
        browser = null;

        let finalImageUrl = imageUrl;
        if (finalImageUrl && !finalImageUrl.startsWith('http')) {
            try {
                const pageUrl = new URL(url);
                finalImageUrl = new URL(finalImageUrl, pageUrl.origin).href;
            } catch (urlError) {
                console.warn(`[Image Scrape Puppeteer] Could not resolve relative image URL (${finalImageUrl}) on page ${url}:`, urlError.message);
                finalImageUrl = null;
            }
        }

        if (finalImageUrl && (finalImageUrl.includes('placeholder') || finalImageUrl.includes('no-image') || finalImageUrl.includes('default'))) {
            console.log(`[Image Scrape Puppeteer] Scraped image URL might be a placeholder: ${finalImageUrl}`);
            finalImageUrl = null;
        }

        console.log(`[Image Scrape Puppeteer] Final Scraped URL for ${url}: ${finalImageUrl}`);
        imageCache.set(url, finalImageUrl || null);
        return finalImageUrl || null;

    } catch (error) {
        console.error(`[Image Scrape Puppeteer] Failed to scrape image from ${url}: ${error.message}`);
        if (browser) await browser.close();
        imageCache.set(url, null);
        return null;
    }
}

// --- Helper Function to Check Relevance ---
function isRelevantAlternative(originalCategory, productInfo, alt) {
    let keywords = [];
    const genericKeywords = ['product', 'item', 'deal'];
    const altNameDesc = ((alt.name || '') + ' ' + (alt.description || '')).toLowerCase();

    const irrelevantKeywords = [
        'book', 'cd', 'dvd', 'music', 'album', 'clock', 'watch', 'timer',
        'toy', 'game', 'puzzle', 'doorbell', 'camera', 'security',
    ];

    let primaryCategory = originalCategory ? originalCategory.toLowerCase() : null;
    if (!primaryCategory && productInfo.name) {
        const lowerName = productInfo.name.toLowerCase();
        if (lowerName.includes('tv') || lowerName.includes('television')) primaryCategory = 'television';
        else if (lowerName.includes('phone') || lowerName.includes('mobile')) primaryCategory = 'phone';
        else if (lowerName.includes('laptop') || lowerName.includes('notebook')) primaryCategory = 'laptop';
        else if (lowerName.includes('headphone') || lowerName.includes('earbud')) primaryCategory = 'headphone';
    }

    const isIrrelevant = irrelevantKeywords.some(keyword =>
        altNameDesc.includes(keyword) &&
        (!primaryCategory || !primaryCategory.includes(keyword))
    );
    if (isIrrelevant) {
        console.warn(`Filtering out potentially irrelevant alternative based on keywords: ${alt.name}`);
        return false;
    }

    if (primaryCategory) {
        if (primaryCategory.includes('tv') || primaryCategory.includes('television')) {
            keywords = ['tv', 'television', 'qled', 'oled', '4k', 'hdr', 'screen', 'display', 'smart tv'];
        } else if (primaryCategory.includes('phone') || primaryCategory.includes('mobile')) {
            keywords = ['phone', 'mobile', 'smartphone', 'android', 'ios', 'iphone', 'galaxy'];
        } else if (primaryCategory.includes('laptop') || primaryCategory.includes('notebook')) {
            keywords = ['laptop', 'notebook', 'computer', 'pc', 'macbook'];
        } else if (primaryCategory.includes('headphone') || primaryCategory.includes('earbud')) {
            keywords = ['headphone', 'earbud', 'headset', 'audio', 'sound', 'wireless', 'bluetooth'];
        } else {
            keywords = (productInfo.name || '').toLowerCase().split(' ').filter(word => word.length > 3 && !genericKeywords.includes(word));
        }
    } else {
        keywords = (productInfo.name || '').toLowerCase().split(' ').filter(word => word.length > 3 && !genericKeywords.includes(word));
    }

    if (keywords.length === 0) return true;

    const isRelevantBasedOnKeywords = keywords.some(keyword => altNameDesc.includes(keyword));
     if (!isRelevantBasedOnKeywords) {
         console.warn(`Filtering out alternative based on keyword mismatch: ${alt.name}`);
     }
     return isRelevantBasedOnKeywords;
}

module.exports = {
    validateProductUrl,
    scrapeImageUrlFromPage,
    isRelevantAlternative
};
