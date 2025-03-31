const express = require('express');
const cors = require('cors');
const path = require('path');
const stripeApi = require('./api/stripe');
const helmet = require('helmet'); // You'll need to install this: npm install helmet
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for CORS
app.use(cors({ 
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  credentials: true,
  maxAge: 600
}));

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

// Middleware for parsing JSON (except for webhook endpoint)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhooks') {
    next();
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});

// Add URL-encoded parser with increased limits
app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  parameterLimit: 50000
}));

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