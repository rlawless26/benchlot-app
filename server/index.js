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
http.maxHeaderSize = 512 * 1024; // Increased to 512KB max header size for very large headers

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
  res.header('Access-Control-Allow-Headers', '*'); // Allow all headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
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

// Set very generous limits to avoid "Request Header Fields Too Large" errors
const jsonParserWithLimits = express.json({
  limit: '100mb',  // Increased body size limit to 100MB 
  parameterLimit: 1000000,  // Increased parameter limit 10x
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

// Add URL-encoded parser with greatly increased limits to handle large requests
app.use(express.urlencoded({ 
  limit: '100mb', // Doubled to 100MB
  extended: true,
  parameterLimit: 1000000 // Increased 10x to handle extremely large numbers of parameters
}));

// Add custom error handlers for various size-related errors
app.use((err, req, res, next) => {
  // Handle request aborted errors (often due to large payloads)
  if (err && err.type === 'request.aborted') {
    console.error('Request aborted:', err);
    return res.status(413).json({ error: 'Payload too large' });
  }
  
  // Handle header too large errors
  if (err && (err.statusCode === 431 || (err.message && err.message.includes('header')))) {
    console.error('Header too large error:', err);
    return res.status(431).json({ 
      error: 'Request Header Fields Too Large',
      message: 'The headers sent in this request are too large. Try reducing cookies or other header data.'
    });
  }
  
  // Pass other errors to the next handler
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

// Add a simple placeholder image endpoint for testing - with special error handling
// This comes BEFORE the JSON parser middleware to avoid header size issues
app.get('/api/placeholder/:width/:height', (req, res) => {
  try {
    const { width, height } = req.params;
    
    // Validate dimensions to prevent SVG injection attacks
    const safeWidth = parseInt(width, 10) || 300;
    const safeHeight = parseInt(height, 10) || 200;
    
    // Limit dimensions to reasonable sizes
    const finalWidth = Math.min(Math.max(safeWidth, 10), 1200);
    const finalHeight = Math.min(Math.max(safeHeight, 10), 1200);
    
    // Set headers for caching and content type
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Create a simple SVG placeholder
    const svg = `<svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e3dacc"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#57534E" text-anchor="middle" dominant-baseline="middle">
        ${finalWidth}×${finalHeight}
      </text>
    </svg>`;
    
    // Send the response
    return res.send(svg);
  } catch (error) {
    console.error('Error generating placeholder image:', error);
    
    // Return a fallback SVG in case of any error
    const fallbackSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e3dacc"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#57534E" text-anchor="middle" dominant-baseline="middle">
        Error
      </text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(fallbackSvg);
  }
});

// Create server explicitly with custom settings
const server = http.createServer({
  maxHeaderSize: 512 * 1024, // Increased to 512KB header size limit for handling very large headers
  headersTimeout: 120000, // 120 seconds (2 minutes) to receive headers
  requestTimeout: 300000, // 5 minutes for the entire request
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