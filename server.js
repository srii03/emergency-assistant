const express = require('express');
const axios = require('axios');
const winston = require('winston');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb'); // Added MongoDB
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/emergency-ai';
let db;
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db('emergency-ai');
    logger.info('Connected to MongoDB');
  })
  .catch(err => {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} ${req.url}`);
  next();
});

// Routes

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// System Status
app.get('/status', (req, res) => {
  res.json({ status: 'operational', message: 'All systems are functioning normally.' });
});

// Save Location to MongoDB
app.post('/save-location', async (req, res) => {
  try {
    const { city, country } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City is required.' });
    }

    const location = { city, country: country || 'Unknown', timestamp: new Date() };
    await db.collection('locations').insertOne(location);
    logger.info(`Saved location: ${city}, ${country}`);
    res.status(201).json({ message: 'Location saved successfully.' });
  } catch (error) {
    logger.error(`Error saving location: ${error.message}`);
    res.status(500).json({ error: `Error saving location: ${error.message}` });
  }
});

// Weather Alerts
app.get('/alerts', async (req, res) => {
  try {
    const city = req.query.city || 'Melbourne';
    const country = req.query.country || 'Australia';
    const apiKey = process.env.WEATHERAPI_KEY;

    if (!apiKey) {
      logger.error('WeatherAPI key missing');
      return res.status(500).json({ error: 'WeatherAPI key missing.' });
    }

    const query = `${encodeURIComponent(city)},${encodeURIComponent(country)}`;
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=no`;
    const response = await axios.get(url);
    const data = response.data;

    if (data.error) {
      return res.status(404).json({ error: data.error.message });
    }

    const condition = data.current.condition.text.toLowerCase();
    const alert = getAlertMessage(condition);

    res.json({
      city: data.location.name,
      region: data.location.region,
      country: data.location.country,
      condition: data.current.condition.text,
      temperature: `${data.current.temp_c} °C`,
      humidity: `${data.current.humidity}%`,
      windSpeed: `${data.current.wind_kph} km/h`,
      alert,
      lat: data.location.lat,
      lon: data.location.lon,
    });
  } catch (error) {
    logger.error(`Error fetching alerts: ${error.message}`);
    res.status(500).json({ error: `Error fetching alerts: ${error.message}` });
  }
});

// Weather Forecast
app.get('/forecast', async (req, res) => {
  try {
    const city = req.query.city || 'Melbourne';
    const country = req.query.country || 'Australia';
    const apiKey = process.env.WEATHERAPI_KEY;

    if (!apiKey) {
      logger.error('WeatherAPI key missing');
      return res.status(500).json({ error: 'WeatherAPI key missing.' });
    }

    const query = `${encodeURIComponent(city)},${encodeURIComponent(country)}`;
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`;
    const response = await axios.get(url);
    const data = response.data;

    if (data.error) {
      return res.status(404).json({ error: data.error.message });
    }

    const forecast = data.forecast.forecastday.map(day => ({
      date: day.date,
      condition: day.day.condition.text,
      maxTemp: `${day.day.maxtemp_c} °C`,
      minTemp: `${day.day.mintemp_c} °C`,
      chanceOfRain: `${day.day.daily_chance_of_rain}%`,
    }));

    res.json({
      city: data.location.name,
      country: data.location.country,
      forecast,
    });
  } catch (error) {
    logger.error(`Error fetching forecast: ${error.message}`);
    res.status(500).json({ error: `Error fetching forecast: ${error.message}` });
  }
});

// Safety Recommendations
app.get('/recommendations', async (req, res) => {
  try {
    const city = req.query.city || 'Melbourne';
    const country = req.query.country || 'Australia';
    const apiKey = process.env.WEATHERAPI_KEY;

    if (!apiKey) {
      logger.error('WeatherAPI key missing');
      return res.status(500).json({ error: 'WeatherAPI key missing.' });
    }

    const query = `${encodeURIComponent(city)},${encodeURIComponent(country)}`;
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=no`;
    const response = await axios.get(url);
    const data = response.data;

    if (data.error) {
      return res.status(404).json({ error: data.error.message });
    }

    const condition = data.current.condition.text.toLowerCase();
    const recommendations = getRecommendations(condition);

    res.json({
      city: data.location.name,
      region: data.location.region,
      country: data.location.country,
      condition: data.current.condition.text,
      recommendations,
      lat: data.location.lat,
      lon: data.location.lon,
    });
  } catch (error) {
    logger.error(`Error fetching recommendations: ${error.message}`);
    res.status(500).json({ error: `Error fetching recommendations: ${error.message}` });
  }
});

// Emergency News
app.get('/news', async (req, res) => {
  try {
    const apiKey = process.env.NEWSAPI_KEY;

    if (!apiKey) {
      logger.error('NewsAPI key missing');
      return res.status(500).json({ error: 'NewsAPI key missing.' });
    }

    const url = `https://newsapi.org/v2/everything?q=emergency&sortBy=publishedAt&apiKey=${apiKey}&pageSize=5`;
    const response = await axios.get(url);

    if (response.status !== 200) {
      logger.error(`NewsAPI error: ${response.data.message}`);
      return res.status(response.status).json({ error: `NewsAPI error: ${response.data.message}` });
    }

    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description || 'No description available.',
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
    }));

    res.json({ articles });
  } catch (error) {
    logger.error(`Error fetching news: ${error.message}`);
    res.status(500).json({ error: `Error fetching news: ${error.message}` });
  }
});

// Resource Locations (Static Example)
app.get('/resources', (req, res) => {
  const city = req.query.city || 'Melbourne';
  res.json({
    city,
    lat: -37.8136,
    lon: 144.9631,
    resources: [
      { type: 'Pharmacy', status: 'Main St Pharmacy: Open 24/7' },
      { type: 'Shelter', status: 'City Center Shelter: 100 beds available' },
      { type: 'Hospital', status: 'General Hospital: Emergency services active' },
    ],
  });
});

// First Aid Tips
app.get('/first-aid', (req, res) => {
  res.json({
    tips: [
      { message: 'For cuts, clean the wound with water and apply antiseptic.' },
      { message: 'For burns, run cold water over the burn for 10 minutes.' },
      { message: 'Learn CPR and keep emergency numbers handy.' },
    ],
  });
});

// Helper: Generate Alert Messages
function getAlertMessage(condition) {
  if (condition.includes('storm')) return 'Severe storm warning: Take immediate shelter.';
  if (condition.includes('rain')) return 'Heavy rain warning: Avoid low-lying areas.';
  if (condition.includes('hot')) return 'Heatwave warning: Stay indoors and hydrate.';
  return 'No severe weather alerts at the moment.';
}

// Helper: Recommendations Based on Condition
function getRecommendations(condition) {
  if (condition.includes('storm') || condition.includes('rain')) return [
    { message: 'Stay indoors and avoid flooded roads.' },
    { message: 'Check weather advisories.' },
  ];
  if (condition.includes('hot')) return [
    { message: 'Stay hydrated and avoid sun exposure.' },
    { message: 'Check on vulnerable individuals.' },
  ];
  return [
    { message: 'Stay updated with weather reports.' },
    { message: 'Keep an emergency kit ready.' },
  ];
}

// Start Server
app.listen(port, () => {
  logger.info(`🚀 Emergency AI Assistant running on port ${port}`);
});