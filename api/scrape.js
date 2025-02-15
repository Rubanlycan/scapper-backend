const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');
const cors = require('cors');

const corsHandler = cors({
  origin: 'https://webscrapper-beige.vercel.app',  // Your frontend URL
  methods: ['GET', 'POST'],  // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
});

// Define the scrape handler
module.exports = async (req, res) => {
  // Use CORS middleware to handle preflight OPTIONS requests
  corsHandler(req, res, async () => {
    if (req.method === 'GET') {
      if (req.url.startsWith('/scrape')) {
        // Handle the /scrape route
        const url = req.query.url; // Get the Amazon URL from the query parameters

        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        try {
          const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: true,
          });
          const page = await browser.newPage();
          await page.goto(url);

          console.log(url);  // Debugging log to verify the URL

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
      } else if (req.url === '/') {
        // Handle the root (/) route, returning a default response or redirection
        res.status(200).send("Welcome to the Scraper API! Please use /scrape endpoint for scraping.");
      } else {
        // Handle unsupported routes
        res.status(404).json({ error: 'Route not found' });
      }
    } else {
      // Handle unsupported HTTP methods
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  });
};
