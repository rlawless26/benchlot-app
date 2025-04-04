const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const stripeApi = require('./api/stripe');
const emailApi = require('./api/email');
const helmet = require('helmet'); // You'll need to install this: npm install helmet
require('dotenv').config();

// Increase Node.js header size limits
http.maxHeaderSize = 128 * 1024; // Set max header size to 128KB

const app = express();
const PORT = process.env.PORT || 3001;

// Simple request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Note: Previously had complex cookie management middleware here.
// Now handled in clean-server.js with a more straightforward approach.

// CORS middleware
app.use((req, res, next) => {
  // Simplified CORS setup
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Handle OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Content Security Policy using Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://*.stripe.com",
        "https://*.stripe.network",
        "https://*.hs-scripts.com",
        "http://*.hs-scripts.com",
        "'unsafe-inline'",
        "blob:"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://*.stripe.com",
        "https://fonts.googleapis.com",
        "https://p.typekit.net",
        "https://use.typekit.net"
      ],
      connectSrc: [
        "'self'",
        "https://*.stripe.com",
        "https://api.stripe.com",
        "https://r.stripe.com",
        "https://m.stripe.com",
        "https://*.supabase.co",
        "https://hooks.stripe.com",
        "https://js.stripe.com",
        "https://checkout.stripe.com"
      ],
      frameSrc: [
        "'self'",
        "https://*.stripe.com",
        "https://*.stripe.network",
        "https://connect.stripe.com",
        "https://checkout.stripe.com"
      ],
      imgSrc: [
        "'self'",
        "https://*.stripe.com",
        "https://*.supabase.co",
        "data:",
        "https://js.stripe.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://use.typekit.net"
      ]
    }
  }
}));

// Set custom limits to avoid "Request Header Fields Too Large" errors
const jsonParserWithLimits = express.json({
  limit: '50mb',  // Body size limit
  parameterLimit: 100000,  // Parameter limit
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON:', e);
      throw new Error('Invalid JSON');
    }
  }
});

// Middleware for parsing JSON (except for webhook endpoint)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhooks') {
    next();
  } else {
    jsonParserWithLimits(req, res, (err) => {
      if (err) {
        console.error('Error parsing request:', err);
        return res.status(400).json({ error: 'Bad request', details: err.message });
      }
      next();
    });
  }
});

// Add URL-encoded parser with increased limits
app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  parameterLimit: 100000
}));

// Add custom error handler for large header errors
app.use((err, req, res, next) => {
  if (err && err.type === 'request.aborted') {
    console.error('Request aborted:', err);
    return res.status(413).json({ error: 'Payload too large' });
  }
  next(err);
});

// API routes
app.use('/api/stripe', stripeApi);
app.use('/api/email', emailApi);

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

// Note: All temporary endpoints for handling Stripe Connect have been removed
// The clean implementation is in server/clean-server.js
// To use it, run: npm run clean-server
// Note: Temporary minimal-link endpoint removed
// Clean implementation is in server/clean-server.js

// Add a minimal account status endpoint as well
// Note: Temporary account-status-minimal endpoint removed
// Clean implementation is in server/clean-server.js
// Note: Custom middleware for minimal endpoints removed
// Clean implementation is in server/clean-server.js

// Create server explicitly with custom settings
const server = http.createServer({
  maxHeaderSize: 128 * 1024, // 128KB header size limit for normal requests
  headersTimeout: 65000, // 65 seconds to receive headers
  requestTimeout: 120000, // 2 minutes for the entire request
  keepAliveTimeout: 65000 // slightly more than 60 seconds
}, app);

// Start the server with custom error handling
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server max header size: ${http.maxHeaderSize / 1024}KB`);
});

// Add error handler for the server
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'HPE_HEADER_OVERFLOW') {
    console.error('Header overflow error - try increasing maxHeaderSize');
  }
});