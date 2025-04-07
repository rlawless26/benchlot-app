// Simple API handler for Vercel
const express = require('express');
const cors = require('cors');
const app = express();

// Parse JSON bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Simple health check endpoint
app.use('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Benchlot API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    env: {
      SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not set',
      SUPABASE_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'Not set'
    }
  });
});

// Handle email API
app.use('/api/email/test-connection', (req, res) => {
  res.json({
    message: 'Email API endpoint is working',
    environment: process.env.NODE_ENV,
    sendgridApiKey: !!process.env.SENDGRID_API_KEY,
    frontendUrl: process.env.REACT_APP_FRONTEND_URL || 'Not set',
    timestamp: new Date().toISOString()
  });
});

// Default handler for all API routes
app.use('/api/*', (req, res) => {
  res.json({
    message: 'API endpoint reached',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Export handler for Vercel serverless functions
module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    // Handle CORS preflight requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
    return;
  }
  
  // Handle the request through the Express app
  return app(req, res);
};