// Script to test SendGrid templates
require('dotenv').config();

// using Twilio SendGrid's v3 Node.js Library
const sgMail = require('@sendgrid/mail');
const emailService = require('./utils/emailService');

// Validate environment
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);

// Get command line args
const recipient = process.argv[2] || 'robertlawless@protonmail.com';
const templateType = process.argv[3] || 'listing-published';

console.log(`Will send ${templateType} template email to: ${recipient}`);

// Check which template to test
switch (templateType.toLowerCase()) {
  case 'listing-published':
    console.log('Testing LISTING_PUBLISHED template...');
    emailService.sendListingPublishedEmail(
      recipient,
      {
        title: 'DeWalt Power Drill (Test)',
        price: 129.99,
        image: 'https://benchlot.com/images/placeholder-tool.jpg',
        id: '12345-test-id'
      }
    ).then(result => {
      console.log('Email send result:', result);
    }).catch(error => {
      console.error('Error sending template email:', error);
    });
    break;
    
  case 'account-creation':
    console.log('Testing ACCOUNT_CREATION template...');
    emailService.sendAccountCreationEmail(
      recipient,
      'Test User'
    ).then(result => {
      console.log('Email send result:', result);
    }).catch(error => {
      console.error('Error sending template email:', error);
    });
    break;
    
  case 'message-received':
    console.log('Testing MESSAGE_RECEIVED template...');
    emailService.sendMessageReceivedEmail(
      recipient,
      {
        senderName: 'Test Sender',
        messageText: 'This is a test message to verify the message received template is working correctly.',
        senderId: 'test-sender-id-123'
      }
    ).then(result => {
      console.log('Email send result:', result);
    }).catch(error => {
      console.error('Error sending template email:', error);
    });
    break;
    
  case 'test':
    console.log('Testing basic test template...');
    emailService.sendTestEmail(
      recipient
    ).then(result => {
      console.log('Email send result:', result);
    }).catch(error => {
      console.error('Error sending template email:', error);
    });
    break;
    
  default:
    console.error(`Unknown template type: ${templateType}`);
    console.log('Available templates:');
    console.log('- listing-published');
    console.log('- account-creation');
    console.log('- message-received');
    console.log('- test');
    process.exit(1);
}

console.log('Email request sent, waiting for result...');