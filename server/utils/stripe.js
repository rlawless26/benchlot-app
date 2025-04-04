// Load environment variables from server/.env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Verify we have the key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY is not set. Please check your .env file');
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Initialize Stripe
const stripe = require('stripe')(stripeKey);

module.exports = stripe;