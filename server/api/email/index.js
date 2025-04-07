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
    
    // Validate the listingDetails structure
    if (!listingDetails.title || !listingDetails.price || !listingDetails.id) {
      console.log('Invalid listing details structure:', listingDetails);
      return res.status(400).json({ error: 'Listing details must include title, price, and id' });
    }
    
    console.log('Sending listing published email with details:', {
      to: email,
      listing_title: listingDetails.title,
      listing_price: listingDetails.price,
      listing_id: listingDetails.id
    });
    
    const result = await emailService.sendListingPublishedEmail(email, listingDetails);
    console.log('sendListingPublishedEmail result:', result);
    
    if (result.success) {
      return res.status(200).json({ message: 'Listing published email sent successfully' });
    } else {
      console.error('SendGrid API error details:', result.error);
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
    // Get SendGrid API key details (safely - only show first/last few chars)
    const apiKey = process.env.SENDGRID_API_KEY || '';
    const maskedKey = apiKey 
      ? `${apiKey.substring(0, 5)}...${apiKey.length > 10 ? apiKey.substring(apiKey.length - 5) : ''} (${apiKey.length} chars)` 
      : 'Not set';

    // Check template IDs
    const emailService = require('../../utils/emailService');
    const templateIds = emailService.TEMPLATE_IDS || { message: 'Template IDs not exported' };
    
    return res.status(200).json({
      message: 'Email API endpoint is working',
      environment: process.env.NODE_ENV,
      sendgridApiKey: maskedKey,
      frontendUrl: process.env.FRONTEND_URL || 'Not set',
      availableEndpoints: [
        '/api/email/test-connection (GET)',
        '/api/email/account-creation (POST)',
        '/api/email/password-reset (POST)',
        '/api/email/listing-published (POST)',
        '/api/email/message-received (POST)',
        '/api/email/offer-received (POST)',
        '/api/email/test (POST)',
        '/api/email/offer-update (POST)',
        '/api/email/message-sent (POST)'
      ],
      templateIdSample: templateIds.LISTING_PUBLISHED || 'Not available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Route for sending offer update email
router.post('/offer-update', async (req, res) => {
  try {
    const { email, offerDetails } = req.body;
    
    console.log('Received offer-update request:', {
      email, 
      offerDetails
    });
    
    if (!email || !offerDetails) {
      console.log('Missing required fields for offer-update email');
      return res.status(400).json({ error: 'Email and offer details are required' });
    }
    
    const result = await emailService.sendOfferUpdateEmail(email, offerDetails);
    console.log('sendOfferUpdateEmail result:', result);
    
    if (result.success) {
      return res.status(200).json({ message: 'Offer update email sent successfully' });
    } else {
      console.error('SendGrid API error details:', result.error);
      return res.status(500).json({ error: 'Failed to send offer update email', details: result.error });
    }
  } catch (error) {
    console.error('Error sending offer update email:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Route for sending message sent email
router.post('/message-sent', async (req, res) => {
  try {
    const { email, messageDetails } = req.body;
    
    console.log('Received message-sent request:', {
      email, 
      messageDetails
    });
    
    if (!email || !messageDetails) {
      console.log('Missing required fields for message-sent email');
      return res.status(400).json({ error: 'Email and message details are required' });
    }
    
    const result = await emailService.sendMessageSentEmail(email, messageDetails);
    console.log('sendMessageSentEmail result:', result);
    
    if (result.success) {
      return res.status(200).json({ message: 'Message sent email sent successfully' });
    } else {
      console.error('SendGrid API error details:', result.error);
      return res.status(500).json({ error: 'Failed to send message sent email', details: result.error });
    }
  } catch (error) {
    console.error('Error sending message sent email:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;