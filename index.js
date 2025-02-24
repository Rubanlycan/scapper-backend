const express = require("express");
const playwright = require("playwright");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000; // Render assigns a port dynamically

app.use(
  cors({
    origin: "https://webscrapper-beige.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

(async () => {
  console.log("Checking Playwright browsers...");
  try {
    execSync("npx playwright install chromium --with-deps", { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to install Playwright browsers:", error);
  }
  console.log("Playwright browsers installed.");
})();

app.get("/api/scrape", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const BROWSER_PATH = '/opt/render/.cache/ms-playwright/chromium-1155/chrome-linux/chrome';
    // Launch browser with Playwright
    const browser = await playwright.chromium.launch({
      headless: true, // Run in headless mode
      executablePath: BROWSER_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Ensure compatibility
    });

    const page = await browser.newPage();
    await page.goto(url);

    // Scraping list items
    const listItems = await page.$$eval(
      "ul.a-unordered-list.a-vertical.a-spacing-mini li span.a-list-item",
      (items) =>
        items.map((item, index) => ({ [`point${index + 1}`]: item.textContent.trim() }))
    );

    // Scraping MRP (Maximum Retail Price)
    const MRP = await page.evaluate(() => {
      const mrpElement = document.querySelector(".a-text-price .a-size-base");
      return mrpElement ? mrpElement.textContent.trim() : "";
    });

    // Scraping product details
    const productDetails = await page.evaluate(() => {
      const title = document.getElementById("productTitle")?.textContent.trim();
      const salePrice = document.querySelector(".a-price-whole")?.textContent.trim();
      const reviews = document.getElementById("acrCustomerReviewText")?.textContent.trim();
      const ratings = document.querySelector(".a-size-base .a-color-base")?.textContent.trim();

      return { title, salePrice, reviews, ratings };
    });

    await browser.close();

    if (!productDetails.title) {
      return res.status(404).json({ error: "Product details not found" });
    }

    res.json({ ...productDetails, listItems, url, MRP });
  } catch (error) {
    console.error("Error scraping product:", error);
    res.status(500).json({ error: "Failed to scrape product" });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
