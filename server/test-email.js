// Test script for verifying SendGrid email configuration from the server
require('dotenv').config();
const emailService = require('./utils/emailService');

// Your actual email address for testing
const TEST_EMAIL = 'rob@benchlot.com';

async function testEmail() {
  console.log('Testing SendGrid from server...');
  console.log(`Sending email to: ${TEST_EMAIL}`);
  
  try {
    const result = await emailService.sendTestEmail(TEST_EMAIL);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Check your inbox for the test email.');
    } else {
      console.error('❌ Failed to send email:', result.error);
      console.error('Please check your SendGrid configuration and API key.');
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testEmail();