// Test script for verifying SendGrid email configuration
require('dotenv').config(); // Load environment variables
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

// Your actual email address for testing
const TEST_EMAIL = 'rob@benchlot.com';
const SENDER_EMAIL = 'notifications@benchlot.com';

async function testSendGridIntegration() {
  console.log('Testing SendGrid integration...');
  console.log(`Sending from: ${SENDER_EMAIL} to: ${TEST_EMAIL}`);
  console.log('Using API key:', process.env.REACT_APP_SENDGRID_API_KEY.substring(0, 10) + '...');
  
  try {
    // Create a simple test email
    const msg = {
      to: TEST_EMAIL,
      from: SENDER_EMAIL,
      subject: 'Benchlot SendGrid Test',
      text: 'This is a test email from Benchlot using SendGrid.',
      html: '<strong>This is a test email from Benchlot using SendGrid.</strong>',
    };
    
    // Send the email
    await sgMail.send(msg);
    console.log('✅ Test email sent successfully!');
    console.log('Check your inbox for the test email.');
    console.log('The email should appear to be from:', SENDER_EMAIL);
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(error);
    
    if (error.response) {
      console.error('Error response body:', error.response.body);
    }
    
    console.error('Please check your SendGrid configuration and API key.');
  }
}

// Run the test
testSendGridIntegration();