
const puppeteer = require('puppeteer-core');
const chrome = require("@sparticuz/chromium");
const cors = require('cors');


module.exports = async (req, res) => {
  const corsHandler = cors({
    origin: 'https://webscrapper-beige.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  corsHandler(req, res, async () => {
    if (req.method === 'GET' && req.url.startsWith('/api/scrape')) {
      const url = req.query.url;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      try {
        const browser = await puppeteer.launch({
          args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
          defaultViewport: chrome.defaultViewport,
          ignoreDefaultArgs: ['--disable-extensions'],
          executablePath: await chrome.executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        await page.goto(url);

        const listItems = await page.$$eval(
          'ul.a-unordered-list.a-vertical.a-spacing-mini li span.a-list-item',
          (items) => {
            return items.map((item, index) => {
              return { [`point${index + 1}`]: item.textContent.trim() };
            });
          }
        );

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
    } else {
      res.status(404).send('Not Found');
    }
  });
};
