const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());

app.get('/scrape', async (req, res) => {
  const url = req.query.url; // Get the Amazon URL from the query parameters

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
console.log(url)
const listItems =   await page.$$eval('ul.a-unordered-list.a-vertical.a-spacing-mini li span.a-list-item', (items) => {
  return items.map((item, index) => {

    return {[`point${index + 1}`]: item.textContent.trim()};
  });
});

const MRP = await page.evaluate(() => {
  // Attempt to find the MRP using common Amazon selectors
  const mrpElement = document.querySelector('.a-text-price .a-size-base');
  return mrpElement ? mrpElement.textContent.trim() : '';
});
    const productDetails = await page.evaluate(() => {

      const title = document.getElementById('productTitle')?.textContent.trim();
      const salePrice = document.querySelector('.a-price-whole')?.textContent.trim();
      const reviews = document.getElementById('acrCustomerReviewText')?.textContent.trim();
      const ratings = document.querySelector('.a-size-base .a-color-base')?.textContent.trim();


      

      return { title, salePrice,reviews,ratings };
    });

    await browser.close();

    if (!productDetails.title ) {
      return res.status(404).json({ error: 'Product details not found' });
    }

    res.json({...productDetails,listItems,url,MRP});
  } catch (error) {
    console.error('Error scraping product:', error);
    res.status(500).json({ error: 'Failed to scrape product' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
