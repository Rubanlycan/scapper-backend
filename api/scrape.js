// api/scrape.js
const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const url = req.query.url; // Get the Amazon URL from the query parameters

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url);
      console.log('Scraping URL:', url);

      // Scraping the list items
      const listItems = await page.$$eval('ul.a-unordered-list.a-vertical.a-spacing-mini li span.a-list-item', (items) => {
        return items.map((item, index) => {
          return { [`point${index + 1}`]: item.textContent.trim() };
        });
      });

      // Scraping MRP
      const MRP = await page.evaluate(() => {
        const mrpElement = document.querySelector('.a-text-price .a-size-base');
        return mrpElement ? mrpElement.textContent.trim() : '';
      });

      // Scraping other product details
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

      // Send the data back as a JSON response
      res.json({ ...productDetails, listItems, url, MRP });

    } catch (error) {
      console.error('Error scraping product:', error);
      res.status(500).json({ error: 'Failed to scrape product' });
    }
  } else {
    // Handle invalid methods (only GET is supported)
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
