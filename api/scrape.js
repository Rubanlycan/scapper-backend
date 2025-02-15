const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Scrape the product details here
    const productDetails = await page.evaluate(() => {
      return {
        title: document.querySelector('title')?.innerText, // Sample product data
      };
    });

    await browser.close();
    
    res.json(productDetails);
  } catch (error) {
    console.error('Error scraping:', error);
    res.status(500).json({ error: 'Failed to scrape' });
  }
};
