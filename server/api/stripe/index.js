const express = require('express');
const paymentsRouter = require('./payments');
const connectRouter = require('./connect');
const webhooksRouter = require('./webhooks');
const stripe = require('../../utils/stripe');

const router = express.Router();

// Direct create route that handles POST form submission
router.post('/direct-create', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('Received direct create request:', req.body);
    
    // Create a Stripe account (can be a test account for demo purposes)
    const account = await stripe.accounts.create({
      type: 'express',
      email: req.body.email || 'test@example.com',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      }
    });
    
    console.log('Created account directly:', account.id);
    
    // Create an account link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    console.log('Created account link:', accountLink.url);
    
    // Redirect directly to Stripe
    return res.redirect(accountLink.url);
  } catch (error) {
    console.error('Error in direct create endpoint:', error);
    res.send(`<html><body><h1>Error</h1><p>${error.message}</p><a href="/seller/signup">Go back</a></body></html>`);
  }
});

router.use('/payments', paymentsRouter);
router.use('/connect', connectRouter);
router.use('/webhooks', webhooksRouter);

module.exports = router;