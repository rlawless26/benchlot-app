const express = require('express');
const cors = require('cors');
const path = require('path');
const stripeApi = require('./api/stripe');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for CORS
app.use(cors());

// Middleware for parsing JSON (except for webhook endpoint)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhooks') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// API routes
app.use('/api/stripe', stripeApi);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Root endpoint (for API health check)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Benchlot API is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});