const express = require('express');
const stripe = require('../../utils/stripe');
const { supabase } = require('../../utils/supabaseClient');
const router = express.Router();

// Create a Connect account for a seller
router.post('/create-connect-account', async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    // Create a Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        user_id: userId
      }
    });
    
    // Update the user record with the Stripe account ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stripe_account_id: account.id,
        stripe_account_status: 'pending'
      })
      .eq('id', userId);
      
    if (updateError) {
      return res.status(500).json({ error: 'Failed to update user record' });
    }
    
    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    res.json({ accountLink: accountLink.url });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check account status for a seller
router.get('/account-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the user's Stripe account ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();
      
    if (userError || !user.stripe_account_id) {
      return res.status(400).json({ error: 'User not found or no Stripe account' });
    }
    
    // Check the account status in Stripe
    const account = await stripe.accounts.retrieve(user.stripe_account_id);
    
    // Determine if the account is fully onboarded
    const isOnboarded = 
      account.details_submitted && 
      account.charges_enabled && 
      account.payouts_enabled;
    
    // Update the user record with the current status
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stripe_account_status: isOnboarded ? 'active' : 'pending',
        stripe_account_details_submitted: account.details_submitted
      })
      .eq('id', userId);
      
    res.json({ 
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      status: isOnboarded ? 'active' : 'pending'
    });
  } catch (error) {
    console.error('Error checking account status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a login link for a seller to access their Stripe dashboard
router.get('/dashboard-link/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the user's Stripe account ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();
      
    if (userError || !user.stripe_account_id) {
      return res.status(400).json({ error: 'User not found or no Stripe account' });
    }
    
    // Create a login link
    const loginLink = await stripe.accounts.createLoginLink(user.stripe_account_id);
    
    res.json({ url: loginLink.url });
  } catch (error) {
    console.error('Error creating dashboard link:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;