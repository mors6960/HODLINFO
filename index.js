const express = require('express');
const path = require('path'); // Corrected the quotes here
const axios = require('axios');

const mongoose = require('mongoose');


const app = express();
const port = 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'image')));

app.use(express.urlencoded({extended:false}))
// View Engine Setup
app.set('view engine', 'ejs')



// app.get('/', function(req, res){
//     res.render('index')
// })




// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your_database', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Define schema
const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String
});

// Create model
const Ticker = mongoose.model('Ticker', tickerSchema);

// Fetch data from WazirX API and store in MongoDB
// Fetch data from WazirX API and store in MongoDB
const fetchAndStoreTickers = async () => {
    try {
      const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
      
      // Check if response status is okay
      if (response.status === 200) {
        // Iterate over ticker objects and store them in MongoDB
        for (const symbol in response.data) {
          const ticker = response.data[symbol];
          await Ticker.create({
            name: ticker.symbol,
            last: ticker.last,
            buy: ticker.buy,
            sell: ticker.sell,
            volume: ticker.volume,
            base_unit: ticker.base_unit
          });
        }
        console.log('Data stored in MongoDB successfully');
      } else {
        console.error('Failed to fetch data from WazirX API:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching and storing data:', error);
    }
  };
  

fetchAndStoreTickers();

// Route to fetch data from MongoDB

  // Route to fetch data from MongoDB
  app.get('/', async (req, res) => {
    try {
        const selectedCurrency = req.query.currency; // Get the selected currency from the query string
        let tickers;
        
        if (selectedCurrency) {
            // Fetch tickers for the selected currency
            tickers = await Ticker.find({ base_unit: selectedCurrency }).limit(10);
        } else {
            // Fetch all tickers if no currency is selected
            tickers = await Ticker.find().limit(10);
        }

        res.render('index', { tickers }); // Pass the fetched data to the view
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });