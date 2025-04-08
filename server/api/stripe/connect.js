const express = require('express');
const stripe = require('../../utils/stripe');
const { supabase } = require('../../utils/supabaseClient');
const router = express.Router();

// Lightweight auth middleware for token-based requests
const lightweightAuth = async (req, res, next) => {
  try {
    // Check if auth header is provided
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Attach the user to the request
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Note: This file contains legacy endpoints
// For the current implementation, see server/api/stripe/connect-clean.js

// Extremely minimal endpoint with zero authentication for standalone HTML page
router.get('/minimal-link', async (req, res) => {
  try {
    console.log('Processing minimal link request from standalone page');
    
    // Add CORS headers specifically for this endpoint
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Create a test Stripe account with minimal data
    const account = await stripe.accounts.create({
      type: 'express',
      email: 'test@example.com', // For testing only
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        product_description: 'Woodworking tools'
      }
    });
    
    console.log('Created minimal account:', account.id);
    
    // Create a Connect account link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    console.log('Created minimal account link:', accountLink.url);
    
    // Return the URL as pure JSON with no session data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating minimal link:', error);
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoint - no longer used
router.get('/create-simple-link', async (req, res) => {
  try {
    console.log('Creating simple Stripe link for user:', req.user.id);
    
    // Check if user already has a Stripe account
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', req.user.id)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userError);
      return res.status(500).json({ 
        error: 'Database error when checking user', 
        details: userError.message 
      });
    }
    
    let accountId;
    
    // If user already has a Stripe account, use that
    if (existingUser && existingUser.stripe_account_id) {
      console.log('User already has Stripe account:', existingUser.stripe_account_id);
      accountId = existingUser.stripe_account_id;
    } else {
      // Create a new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        email: req.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          user_id: req.user.id
        }
      });
      
      accountId = account.id;
      console.log('Created new Stripe account:', accountId);
      
      // Update the user record with the Stripe account ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripe_account_id: accountId,
          stripe_account_status: 'pending'
        })
        .eq('id', req.user.id);
        
      if (updateError) {
        console.error('Error updating user record:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update user record', 
          details: updateError.message 
        });
      }
    }
    
    // Create an account link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    console.log('Created simple link, returning JSON:', accountLink.url);
    
    // Return the URL as JSON only (no redirect)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating simple link:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a simple test endpoint that doesn't require parameters
router.get('/simple-connect', async (req, res) => {
  try {
    // Just use a fixed test user for now
    // WARNING: This is just for troubleshooting - don't use in production
    console.log('Using simple connect endpoint with hardcoded values...');
    
    // Hard-code a stripe account creation for testing
    const testAccount = await stripe.accounts.create({
      type: 'express',
      email: 'test@example.com',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      }
    });
    
    console.log('Created test account:', testAccount.id);
    
    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: testAccount.id,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    console.log('Created simple account link:', accountLink.url);
    
    // Send back a simple JSON response with the link
    return res.json({ 
      success: true, 
      accountLink: accountLink.url,
      message: "Test account created - DO NOT USE IN PRODUCTION"
    });
    
  } catch (error) {
    console.error('Error in simple connect endpoint:', error);
    res.status(500).json({
      error: 'Failed to create simple test account',
      details: error.message
    });
  }
});

// Create a token-based endpoint for Stripe Connect account creation with lightweight auth
router.post('/create-account-token', lightweightAuth, async (req, res) => {
  try {
    console.log('Creating account token for user:', req.user.id);
    const userId = req.user.id;
    const email = req.user.email;
    
    // Validate input
    if (!email) {
      console.error('Missing email for user:', userId);
      return res.status(400).json({ 
        error: 'Missing email', 
        details: 'User email is required' 
      });
    }
    
    // Check if user already has a Stripe account
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userError);
      return res.status(500).json({ 
        error: 'Database error when checking user', 
        details: userError.message 
      });
    }
    
    let accountId;
    
    // If user already has a Stripe account, use that
    if (existingUser && existingUser.stripe_account_id) {
      console.log('User already has Stripe account:', existingUser.stripe_account_id);
      accountId = existingUser.stripe_account_id;
    } else {
      // Create a new Stripe Connect account
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
      
      accountId = account.id;
      console.log('Created new Stripe account:', accountId);
      
      // Update the user record with the Stripe account ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripe_account_id: accountId,
          stripe_account_status: 'pending'
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user record:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update user record', 
          details: updateError.message 
        });
      }
    }
    
    // Generate a one-time token
    const token = require('crypto').randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    // Check if stripe_tokens table exists, create it if not
    try {
      const { error: tableError } = await supabase
        .from('stripe_tokens')
        .select('token')
        .limit(1);
      
      if (tableError && tableError.code === 'PGRST116') {
        // Table doesn't exist, create it
        console.log('Creating stripe_tokens table...');
        
        // Unfortunately we can't create tables through the API, so we'll log a message
        console.error('IMPORTANT: Please create a stripe_tokens table with the following columns:');
        console.error('- token (text, primary key)');
        console.error('- stripe_account_id (text)');
        console.error('- user_id (uuid)');
        console.error('- created_at (timestamp with time zone, default now())');
        console.error('- expires_at (timestamp with time zone)');
        console.error('- used_at (timestamp with time zone, nullable)');
        
        // For now, continue without storing the token and return it directly
        return res.json({ 
          token,
          accountId,
          expires: expiresAt.toISOString(),
          warning: 'Token not stored in database - please create stripe_tokens table'
        });
      }
    } catch (error) {
      console.error('Error checking for stripe_tokens table:', error);
    }
    
    // Store token in database
    const { error: tokenError } = await supabase
      .from('stripe_tokens')
      .insert({
        token: token,
        stripe_account_id: accountId,
        user_id: userId,
        expires_at: expiresAt.toISOString()
      });
      
    if (tokenError) {
      console.error('Error storing token:', tokenError);
      return res.status(500).json({ 
        error: 'Failed to store token', 
        details: tokenError.message,
        token: token, // Return it anyway so it can still be used
        accountId: accountId
      });
    }
    
    console.log('Created and stored token for onboarding:', token);
    
    // Return the token to the client
    res.json({ 
      token,
      expires: expiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('Error creating account token:', error);
    res.status(500).json({ 
      error: 'Failed to create account token', 
      details: error.message
    });
  }
});

// Deprecated: old direct redirect handler
router.get(['/direct-redirect', '/stripe-redirect'], async (req, res) => {
  try {
    console.log('Using direct redirect endpoint...');
    
    // Create a test account
    const testAccount = await stripe.accounts.create({
      type: 'express',
      email: 'test@example.com',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      }
    });
    
    console.log('Created redirect test account:', testAccount.id);
    
    // Create an account link
    const accountLink = await stripe.accountLinks.create({
      account: testAccount.id,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    console.log('Created account link, directly redirecting to:', accountLink.url);
    
    // Return an HTML page with auto-redirect instead of a direct redirect
    // This prevents React Router from interfering
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting to Stripe...</title>
          <meta http-equiv="refresh" content="0;url=${accountLink.url}">
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .spinner { display: inline-block; width: 50px; height: 50px; border: 3px solid rgba(0,0,0,.3); border-radius: 50%; border-top-color: #3498db; animation: spin 1s ease-in-out infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Redirecting to Stripe...</h1>
            <div class="spinner"></div>
            <p>You are being redirected to complete your Stripe seller onboarding.</p>
            <p>If you are not redirected automatically, <a href="${accountLink.url}">click here</a>.</p>
          </div>
          <script>
            // Force redirect after a short delay
            setTimeout(function() {
              window.location.href = "${accountLink.url}";
            }, 1000);
          </script>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error in direct redirect endpoint:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Error Creating Stripe Account</h1>
            <p>${error.message}</p>
            <p><a href="/seller/signup">Go Back</a></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Legacy endpoint - no longer used
router.post('/create-connect-account', async (req, res) => {
  try {
    // Debug incoming request
    console.log('Create connect account request received for user:', req.user.id);
    
    // Use the user ID and email from the authenticated user
    const userId = req.user.id;
    const email = req.user.email;
    
    console.log('Using authenticated user data:', { userId, email });
    
    // Use the shared function to create the account
    await createConnectAccount(userId, email, res);
  } catch (error) {
    console.error('Error creating Connect account (POST):', error);
    res.status(500).json({ 
      error: 'Failed to create Stripe Connect account', 
      details: error.message,
      code: error.code || 'unknown'
    });
  }
});

// Shared function to create a Connect account
async function createConnectAccount(userId, email, res) {
  try {
    // Check if user already has a Stripe account
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userError);
      return res.status(500).json({ 
        error: 'Database error when checking user', 
        details: userError.message 
      });
    }
    
    // If user already has a Stripe account, retrieve it and create a new account link
    if (existingUser && existingUser.stripe_account_id) {
      try {
        const existingAccount = await stripe.accounts.retrieve(existingUser.stripe_account_id);
        
        // Create a new account link for the existing account
        const accountLink = await stripe.accountLinks.create({
          account: existingAccount.id,
          refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
          return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
          type: 'account_onboarding',
        });
        
        return res.json({ accountLink: accountLink.url });
      } catch (stripeError) {
        // If the account doesn't exist in Stripe anymore, create a new one
        if (stripeError.code === 'resource_missing') {
          console.log('Stripe account not found, creating new one');
          // Continue with creating a new account
        } else {
          console.error('Error retrieving Stripe account:', stripeError);
          return res.status(500).json({ 
            error: 'Error with Stripe account', 
            details: stripeError.message 
          });
        }
      }
    }
    
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
    
    console.log('Created Stripe account:', account.id);
    
    // Update the user record with the Stripe account ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stripe_account_id: account.id,
        stripe_account_status: 'pending'
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user record:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update user record', 
        details: updateError.message 
      });
    }
    
    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    console.log('Created account link, redirecting to:', accountLink.url);
    
    res.json({ accountLink: accountLink.url });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    
    // Handle Stripe-specific errors
    if (error.type && error.type.startsWith('Stripe')) {
      return res.status(400).json({
        error: 'Stripe API error',
        details: error.message,
        code: error.code || 'stripe_error'
      });
    }
    
    // Handle general server errors
    res.status(500).json({ 
      error: 'Failed to create Stripe Connect account', 
      details: error.message,
      code: error.code || 'unknown'
    });
  }
}

// Add a simple test endpoint to verify API connectivity without Stripe
router.get('/test', (req, res) => {
  res.json({ status: 'Stripe Connect API is working' });
});

// Streamlined endpoint for creating Connect links using lightweight auth
router.get('/lightweight-connect', lightweightAuth, async (req, res) => {
  try {
    console.log('[LIGHTWEIGHT] Creating Connect link for user:', req.user.id);
    
    // Set low response header limits to avoid 431 errors
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Check if user already has a Stripe account
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', req.user.id)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error('[LIGHTWEIGHT] Error checking existing user:', userError);
      return res.status(500).json({ 
        error: 'Database error when checking user', 
        details: userError.message 
      });
    }
    
    let accountId;
    let isNewAccount = false;
    
    // If user already has a Stripe account, use that
    if (existingUser && existingUser.stripe_account_id) {
      console.log('[LIGHTWEIGHT] User already has Stripe account:', existingUser.stripe_account_id);
      accountId = existingUser.stripe_account_id;
      
      // Verify the account still exists in Stripe
      try {
        await stripe.accounts.retrieve(accountId);
      } catch (stripeError) {
        if (stripeError.code === 'resource_missing') {
          console.log('[LIGHTWEIGHT] Stripe account not found, creating new one');
          isNewAccount = true;
        } else {
          throw stripeError;
        }
      }
    } else {
      isNewAccount = true;
    }
    
    // Create a new account if needed
    if (isNewAccount) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: req.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          user_id: req.user.id
        }
      });
      
      accountId = account.id;
      console.log('[LIGHTWEIGHT] Created new Stripe account:', accountId);
      
      // Update the user record with the Stripe account ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripe_account_id: accountId,
          stripe_account_status: 'pending'
        })
        .eq('id', req.user.id);
        
      if (updateError) {
        console.error('[LIGHTWEIGHT] Error updating user record:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update user record', 
          details: updateError.message 
        });
      }
    }
    
    // Create an account link with minimal options
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    console.log('[LIGHTWEIGHT] Created account link, returning JSON with minimal headers');
    
    // Return just the URL with minimal headers to avoid 431 errors
    return res.json({ url: accountLink.url });
  } catch (error) {
    console.error('[LIGHTWEIGHT] Error creating connect link:', error);
    res.status(500).json({ 
      error: 'Failed to create Stripe Connect link', 
      details: error.message,
      code: error.code || 'unknown'
    });
  }
});

// Legacy endpoint - no longer used
router.get('/account-status', async (req, res) => {
  try {
    const userId = req.user.id;
    
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
    
    // Match the status to your database schema's constraints
    // Your schema allows 'pending', 'verified', 'rejected'
    const accountStatus = isOnboarded ? 'verified' : 'pending';
    
    // Set seller_since timestamp if becoming verified for the first time
    const updateData = { 
      stripe_account_status: accountStatus,
      stripe_account_details_submitted: account.details_submitted,
      is_seller: isOnboarded
    };
    
    // If becoming a verified seller for the first time, update seller_since
    if (isOnboarded) {
      const { data: userData } = await supabase
        .from('users')
        .select('is_seller, stripe_account_status')
        .eq('id', userId)
        .single();
        
      if (userData && (!userData.is_seller || userData.stripe_account_status !== 'verified')) {
        updateData.seller_since = new Date().toISOString();
      }
    }
    
    // Update the user record with the current status
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user account status:', updateError);
    }
      
    res.json({ 
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      status: accountStatus
    });
  } catch (error) {
    console.error('Error checking account status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoint - no longer used
router.get('/dashboard-link', async (req, res) => {
  try {
    const userId = req.user.id;
    
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