/**
 * Clean implementation of Stripe Connect for marketplace sellers
 */
const express = require('express');
const stripe = require('../../utils/stripe');
const { supabase } = require('../../utils/supabaseClient');
const router = express.Router();

/**
 * Create a Stripe Connect account for a seller
 * 
 * This endpoint:
 * 1. Gets user ID from a query parameter (not headers or cookies)
 * 2. Verifies the user in the database
 * 3. Creates or retrieves a Stripe account
 * 4. Returns a Stripe Connect onboarding URL
 */
router.get('/onboard', async (req, res) => {
  try {
    // 1. Get and validate user ID from query parameter
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId query parameter'
      });
    }

    console.log(`Creating onboarding link for user: ${userId}`);

    // 2. Verify the user exists and get their email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User verification error:', userError || 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const email = user.email;
    if (!email) {
      return res.status(400).json({ error: 'User email not found' });
    }
    
    // 3. Check if user already has a Stripe account
    const { data: seller, error: sellerError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();
      
    let accountId;
    let isNewAccount = false;
    
    // 4. If seller has an account ID, verify it still exists
    if (seller?.stripe_account_id) {
      try {
        // Check if account exists in Stripe
        await stripe.accounts.retrieve(seller.stripe_account_id);
        accountId = seller.stripe_account_id;
        console.log(`Using existing account: ${accountId}`);
      } catch (err) {
        if (err.code === 'resource_missing') {
          console.log('Account not found in Stripe, creating new one');
          isNewAccount = true;
        } else {
          throw err;
        }
      }
    } else {
      isNewAccount = true;
    }
    
    // 5. Create a new account if needed
    if (isNewAccount) {
      try {
        const account = await stripe.accounts.create({
          type: 'express',
          email: email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          // Set business type to individual by default for simplified onboarding
          business_type: 'individual',
          // Enable incremental onboarding with minimal verification
          settings: {
            payouts: {
              // Defer payout schedule verification
              schedule: {
                interval: 'manual'
              }
            }
          },
          // Specify "eventually due" requirement approach
          tos_acceptance: {
            service_agreement: 'recipient'
          },
          metadata: {
            user_id: userId
          }
        });
        
        accountId = account.id;
        console.log(`Created new Stripe account: ${accountId}`);
        
        // Update the user record with the Stripe account ID
        // Mark as minimal verification but still allow selling
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_account_id: accountId,
            stripe_account_status: 'minimal',  // New status for minimal verification
            is_seller: true,  // Allow selling immediately with minimal verification
            onboarding_progress: 'started'
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating user record:', updateError);
          // Continue anyway - we want to send the user to Stripe even if DB update fails
        }
      } catch (error) {
        // For development: if Connect isn't enabled, create a mock account ID
        if (error.message && error.message.includes('signed up for Connect')) {
          console.log('DEVELOPMENT MODE: Using mock account since Connect is not enabled');
          accountId = 'mock_acct_' + Math.random().toString(36).substring(2, 10);
          
          // Add to database with mock ID
          await supabase
            .from('users')
            .update({
              stripe_account_id: accountId,
              stripe_account_status: 'minimal',
              is_seller: true,
              onboarding_progress: 'started'
            })
            .eq('id', userId);
        } else {
          throw error;
        }
      }
    }
    
    // 6. Create the account link
    let accountLink;
    try {
      accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding?refresh=true`,
        return_url: `${process.env.FRONTEND_URL}/seller/dashboard`,
        type: 'account_onboarding',
        // Specify to only collect eventually due information - this enables incremental onboarding
        collect: 'eventually_due',
      });
    } catch (error) {
      // If this fails due to Connect not being enabled, provide a mock link for development
      if (error.message && error.message.includes('signed up for Connect')) {
        console.log('DEVELOPMENT MODE: Using mock Stripe Connect URL since Connect is not enabled');
        accountLink = {
          url: 'https://connect.stripe.com/setup/mock/test?dev_mode=true'
        };
      } else {
        throw error;
      }
    }
    
    console.log(`Created account link for ${userId}: ${accountLink.url}`);
    
    // 7. Return the onboarding URL
    return res.json({ url: accountLink.url });
    
  } catch (error) {
    console.error('Connect onboarding error:', error);
    return res.status(500).json({
      error: 'Failed to create Connect account',
      message: error.message
    });
  }
});

/**
 * Check the status of a seller's Stripe Connect account
 * Enhanced with incremental onboarding details
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    // Get the user's Stripe account ID and current status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id, stripe_account_status, verification_requirements, last_requirements_check, onboarding_progress')
      .eq('id', userId)
      .single();
      
    if (userError || !user?.stripe_account_id) {
      return res.status(404).json({ error: 'No Stripe account found for this user' });
    }
    
    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripe_account_id);
    
    // Determine account status with more detailed status tracking
    let statusValue = 'minimal';
    if (account.details_submitted && account.payouts_enabled) {
      statusValue = 'active';
    } else if (account.details_submitted) {
      statusValue = 'submitted';
    } else if (account.requirements?.currently_due?.length > 0) {
      statusValue = 'verification_needed';
    }
    
    // Build comprehensive status object
    const status = {
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      status: statusValue,
      can_sell: true, // With incremental onboarding, they can sell with minimal verification
      can_receive_funds: account.payouts_enabled,
      currently_due_count: account.requirements?.currently_due?.length || 0,
      eventually_due_count: account.requirements?.eventually_due?.length || 0
    };
    
    // Update user record with latest status
    // Using our helper function to keep status updates consistent
    await updateUserVerificationStatus(userId, user.stripe_account_id);
    
    return res.json(status);
  } catch (error) {
    console.error('Error checking Connect account status:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Create a login link for a seller to access their Stripe dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    // Get the user's Stripe account ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();
      
    if (userError || !user?.stripe_account_id) {
      return res.status(404).json({ error: 'No Stripe account found for this user' });
    }
    
    // Create a login link
    const loginLink = await stripe.accounts.createLoginLink(user.stripe_account_id);
    
    return res.json({ url: loginLink.url });
  } catch (error) {
    console.error('Error creating dashboard link:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Check what verification requirements are needed for a seller
 * This endpoint separates currently due from eventually due requirements
 */
router.get('/requirements', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    // Get the user's Stripe account ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();
      
    if (userError || !user?.stripe_account_id) {
      return res.status(404).json({ error: 'No Stripe account found for this user' });
    }
    
    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripe_account_id);
    
    // Separate requirements into currently due and eventually due
    const currentlyDue = account.requirements?.currently_due || [];
    const eventuallyDue = account.requirements?.eventually_due || [];
    const pendingVerification = account.requirements?.pending_verification || [];
    
    // Create a user-friendly list of requirements
    const formatRequirement = (req) => {
      return req.replace(/\./g, ' ').replace(/_/g, ' ')
               .replace(/\b\w/g, (c) => c.toUpperCase());
    };
    
    const formattedRequirements = {
      currently_due: currentlyDue.map(formatRequirement),
      eventually_due: eventuallyDue.map(formatRequirement)
                      .filter(req => !currentlyDue.includes(req)),
      pending_verification: pendingVerification.map(formatRequirement)
    };
    
    // Update the user record with current requirements status
    await updateUserVerificationStatus(userId, user.stripe_account_id);
    
    return res.json({
      account_id: account.id,
      can_receive_payments: account.charges_enabled,
      can_receive_payouts: account.payouts_enabled,
      requirements: formattedRequirements,
      verification_status: account.details_submitted ? 'submitted' : 'incomplete',
      eventually_due_count: formattedRequirements.eventually_due.length,
      currently_due_count: formattedRequirements.currently_due.length
    });
  } catch (error) {
    console.error('Error checking account requirements:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Helper function to update a user's verification status in the database
 */
async function updateUserVerificationStatus(userId, accountId) {
  try {
    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(accountId);
    
    // Determine account status based on verification
    let status = 'minimal';
    if (account.details_submitted && account.payouts_enabled) {
      status = 'active';
    } else if (account.details_submitted) {
      status = 'submitted';
    }
    
    // Update the user record
    await supabase
      .from('users')
      .update({
        stripe_account_status: status,
        verification_requirements: {
          currently_due: account.requirements?.currently_due || [],
          eventually_due: account.requirements?.eventually_due || [],
          pending_verification: account.requirements?.pending_verification || []
        },
        last_requirements_check: new Date().toISOString(),
        onboarding_progress: status === 'active' ? 'completed' : 'in_progress'
      })
      .eq('id', userId);
    
    return true;
  } catch (error) {
    console.error('Error updating user verification status:', error);
    return false;
  }
}

module.exports = router;