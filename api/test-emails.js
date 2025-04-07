/**
 * Test Email API Endpoint for Benchlot
 * 
 * This API endpoint allows sending test emails for various transactional events.
 * It's intended for diagnostic and testing purposes only.
 */
 
const emailService = require('../server/utils/emailService');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Require POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'Only POST requests are accepted' });
  }
  
  try {
    const { emailType, recipientEmail, testData } = req.body;
    
    if (!emailType || !recipientEmail) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Missing required parameters: emailType and recipientEmail'
      });
    }
    
    // Validate recipient email is not empty
    if (!recipientEmail.includes('@')) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }
    
    // Validate it's a test email
    if (!recipientEmail.endsWith('benchlot.com') && !recipientEmail.includes('+test@')) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'For security, test emails can only be sent to benchlot.com addresses or addresses with +test@'
      });
    }
    
    let result = { success: false, message: 'Unknown email type' };
    
    // Add [TEST] prefix to all test emails
    const testPrefix = '[TEST] ';
    
    // Use a prefix for each test email ID to ensure we don't overwrite real data
    const testId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Send the appropriate test email based on type
    switch (emailType) {
      case 'welcome':
        result = await emailService.sendAccountCreationEmail(
          recipientEmail,
          testData?.firstName || 'Test User'
        );
        break;
        
      case 'listing-published':
        result = await emailService.sendListingPublishedEmail(
          recipientEmail,
          {
            title: testData?.title || 'Test Power Drill',
            price: testData?.price || 129.99,
            image: testData?.image || 'https://benchlot.com/images/placeholder-tool.jpg',
            id: testData?.id || testId
          }
        );
        break;
        
      case 'password-reset':
        result = await emailService.sendPasswordResetEmail(
          recipientEmail,
          testData?.resetLink || 'https://benchlot.com/reset-password?token=test-token'
        );
        break;
        
      case 'message-received':
        result = await emailService.sendMessageReceivedEmail(
          recipientEmail,
          {
            senderName: testData?.senderName || 'Test Sender',
            messageText: testData?.messageText || 'This is a test message to verify the message notification email system.',
            senderId: testData?.senderId || testId
          }
        );
        break;
        
      case 'offer-received':
        result = await emailService.sendOfferReceivedEmail(
          recipientEmail,
          {
            buyerName: testData?.buyerName || 'Test Buyer',
            listingTitle: testData?.listingTitle || 'Vintage Hand Plane',
            offerAmount: testData?.offerAmount || 75.00,
            listingPrice: testData?.listingPrice || 100.00,
            offerId: testData?.offerId || testId
          }
        );
        break;
        
      case 'offer-update':
        result = await emailService.sendOfferUpdateEmail(
          recipientEmail,
          {
            sellerName: testData?.sellerName || 'Test Seller',
            listingTitle: testData?.listingTitle || 'Vintage Hand Plane',
            status: testData?.status || 'accepted',
            offerAmount: testData?.offerAmount || 75.00,
            counterOffer: testData?.counterOffer,
            listingId: testData?.listingId || testId
          }
        );
        break;
      
      case 'basic-test':
        // Basic text email for testing
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg = {
          to: recipientEmail,
          from: 'notifications@benchlot.com',
          subject: testPrefix + 'Benchlot Email Test',
          text: 'This is a basic test email from Benchlot.',
          html: `<h1>Benchlot Email Test</h1>
                 <p>This is a basic test email sent at ${new Date().toLocaleString()}</p>
                 <p>If you're seeing this, your SendGrid integration is working correctly!</p>`
        };
        
        const sendgridResponse = await sgMail.send(msg);
        result = { 
          success: true, 
          message: 'Basic test email sent',
          statusCode: sendgridResponse[0].statusCode
        };
        break;
      
      default:
        return res.status(400).json({
          error: 'Invalid email type',
          message: `Unknown email type: ${emailType}`,
          validTypes: ['welcome', 'listing-published', 'password-reset', 'message-received', 'offer-received', 'offer-update', 'basic-test']
        });
    }
    
    // Return the result
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Test email "${emailType}" sent to ${recipientEmail}`,
        details: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Failed to send test email "${emailType}"`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};