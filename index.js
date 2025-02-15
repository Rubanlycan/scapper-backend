// index.js (Optional with Middleware)

const express = require('express');
const cors = require('cors');

const app = express();

// Add global middleware like CORS, body parsers, etc.
app.use(cors());
// If you want to add other middlewares, you can include them here as well

// Custom routes or logic can go here
app.get('/', (req, res) => {
  res.status(200).send("Hello from Vercel!");
});

// You can add more global middlewares here if needed
module.exports = app;
