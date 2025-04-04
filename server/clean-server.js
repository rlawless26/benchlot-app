/**
 * Clean implementation of Benchlot API server
 * This is a production-ready approach to the Stripe integration
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from server/.env file
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Debug environment variables (without exposing secrets)
console.log('Environment variables loaded:');
console.log('- PORT:', process.env.PORT || '(using default)');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set (starts with ' + process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...)' : 'not set');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'not set');

// Import routes
const stripeConnectRouter = require('./api/stripe/connect-clean');

// Create Express app
const app = express();
// Use port 3002 for the API server to avoid conflict with React dev server
const PORT = 3002;

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Restrict in production
  credentials: false // No credentials needed for these endpoints
}));

// Add minimal request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Parse JSON but with a size limit
app.use(express.json({ limit: '1mb' })); 

// Mount routes - use /api/v1 prefix for versioning
app.use('/api/v1/stripe/connect', stripeConnectRouter);

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Benchlot API is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Benchlot API running on port ${PORT}`);
});