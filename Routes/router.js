const express = require('express');
const router = express.Router();
const Coin = require('../Models/model');

// Route to fetch data from WazirX API and store in MongoDB
router.get('/', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default; // Dynamic import
    const response = await fetchWazirXData(fetch);
    const data = await response.json(); // Parse JSON response

    // Assuming data is an array of coins
    for (const coinData of data.slice(0, 10)) {
      await Coin.create({
        name: coinData.symbol,
        last: coinData.last,
        buy: coinData.buy,
        sell: coinData.sell,
        volume: coinData.volume,
        base_unit: coinData.base_unit
      });
    }

    // Once data is fetched and stored, render an EJS file
    res.render('../views/interface.ejs', { message: 'Data fetched and stored successfully.' });
  } catch (error) {
    console.error('Error fetching and storing data:', error);
    res.status(500).send('Error fetching and storing data');
  }
});

// Function to fetch data from WazirX API
async function fetchWazirXData(fetch) {
  return fetch('https://api.wazirx.com/api/v2/tickers');
}

module.exports = router;
