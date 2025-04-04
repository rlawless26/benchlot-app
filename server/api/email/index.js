const express = require('express');
const router = express.Router();
const emailService = require('../../utils/emailService');

// Route for sending account creation email
router.post('/account-creation', async (req, res) => {
  try {
    const { email, firstName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const result = await emailService.sendAccountCreationEmail(email, firstName);
    
    if (result.success) {
      return res.status(200).json({ message: 'Account creation email sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send account creation email' });
    }
  } catch (error) {
    console.error('Error sending account creation email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for sending password reset email
router.post('/password-reset', async (req, res) => {
  try {
    const { email, resetLink } = req.body;
    
    if (!email || !resetLink) {
      return res.status(400).json({ error: 'Email and reset link are required' });
    }
    
    const result = await emailService.sendPasswordResetEmail(email, resetLink);
    
    if (result.success) {
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for sending listing published email
router.post('/listing-published', async (req, res) => {
  try {
    const { email, listingDetails } = req.body;
    
    console.log('Received listing-published request:', {
      email,
      listingDetails
    });
    
    if (!email || !listingDetails) {
      console.log('Missing required fields for listing-published email');
      return res.status(400).json({ error: 'Email and listing details are required' });
    }
    
    const result = await emailService.sendListingPublishedEmail(email, listingDetails);
    console.log('sendListingPublishedEmail result:', result);
    
    if (result.success) {
      return res.status(200).json({ message: 'Listing published email sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send listing published email', details: result.error });
    }
  } catch (error) {
    console.error('Error sending listing published email:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Route for sending message received email
router.post('/message-received', async (req, res) => {
  try {
    const { email, messageDetails } = req.body;
    
    if (!email || !messageDetails) {
      return res.status(400).json({ error: 'Email and message details are required' });
    }
    
    const result = await emailService.sendMessageReceivedEmail(email, messageDetails);
    
    if (result.success) {
      return res.status(200).json({ message: 'Message received email sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send message received email' });
    }
  } catch (error) {
    console.error('Error sending message received email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for sending offer received email
router.post('/offer-received', async (req, res) => {
  try {
    const { email, offerDetails } = req.body;
    
    if (!email || !offerDetails) {
      return res.status(400).json({ error: 'Email and offer details are required' });
    }
    
    const result = await emailService.sendOfferReceivedEmail(email, offerDetails);
    
    if (result.success) {
      return res.status(200).json({ message: 'Offer received email sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send offer received email' });
    }
  } catch (error) {
    console.error('Error sending offer received email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const result = await emailService.sendTestEmail(email);
    
    if (result.success) {
      return res.status(200).json({ message: 'Test email sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send test email', details: result.error });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for verifying API connectivity
router.get('/test-connection', async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Email API endpoint is working',
      environment: process.env.NODE_ENV,
      sendgridApiKey: !!process.env.SENDGRID_API_KEY,
      frontendUrl: process.env.FRONTEND_URL || 'Not set',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;