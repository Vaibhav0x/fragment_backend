require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const logger = require('./logger');
const errorHandler = require('./middleware/error-handler');

const app = express();

// Allow CORS for localhost:3000
app.use(
  cors({
    origin: 'http://localhost:3000', // your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health Check
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok', uptime: process.uptime() });
});

// All /v1 routes
app.use('/v1', routes);

// Global Error Handler
app.use(errorHandler);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => logger.info(`Server listening on ${port}`));

module.exports = { app, server };
