const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');
const path = require('path');
const app = express();
const fs = require('fs');
const PORT = process.env.PORT || 5000;

// Configure CORS (same as before)
const corsHandler = cors({
    origin: 'https://webscrapper-beige.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
app.use(corsHandler);

// Root route (same as before)
app.get('/', (req, res) => {
    res.send('Welcome to the Scraper API!');
});

// Scrape route (modified for Playwright)
app.get('/scrape', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log("Current __dirname:", __dirname);
        console.log("Current working directory:", process.cwd());

        // Playwright Launch
        const browser = await chromium.launch({
            headless: true,
            ignoreHTTPSErrors: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: path.join(__dirname, 'chromium', 'chrome') // Path to Chromium
        });

        const page = await browser.newPage();
        await page.goto(url);

        console.log(url);

        // Playwright Scraping (using selectors that match your Puppeteer code)
        const listItems = await page.$$eval('ul.a-unordered-list.a-vertical.a-spacing-mini li span.a-list-item', (items) => {
            return items.map((item, index) => {
                return { [`point${index + 1}`]: item.textContent.trim() };
            });
        });

        const MRP = await page.evaluate(() => {
            const mrpElement = document.querySelector('.a-text-price .a-size-base');
            return mrpElement ? mrpElement.textContent.trim() : '';
        });

        const productDetails = await page.evaluate(() => {
            const title = document.getElementById('productTitle')?.textContent.trim();
            const salePrice = document.querySelector('.a-price-whole')?.textContent.trim();
            const reviews = document.getElementById('acrCustomerReviewText')?.textContent.trim();
            const ratings = document.querySelector('.a-size-base .a-color-base')?.textContent.trim();
            return { title, salePrice, reviews, ratings };
        });

        await browser.close();

        if (!productDetails.title) {
            return res.status(404).json({ error: 'Product details not found' });
        }

        res.json({ ...productDetails, listItems, url, MRP });

    } catch (error) {
        console.error('Error scraping product:', error);
        res.status(500).json({ error: 'Failed to scrape product' });
    }
});

// Start the server (same as before)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});