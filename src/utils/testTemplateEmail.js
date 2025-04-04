// Test script for verifying SendGrid template emails
require('dotenv').config(); // Load environment variables
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

// Your actual email address for testing
const TEST_EMAIL = 'rob@benchlot.com';
const SENDER_EMAIL = 'notifications@benchlot.com';

// Using your actual template ID from SendGrid
const WELCOME_TEMPLATE_ID = 'd-280057e931044ee2ac3cce7d54a216e3'; // Account Creation template

async function testTemplateEmail() {
  console.log('Testing SendGrid template email...');
  console.log(`Sending from: ${SENDER_EMAIL} to: ${TEST_EMAIL}`);
  
  // Dynamic data that will replace variables in your template
  const dynamicTemplateData = {
    first_name: 'Robert',
    login_link: 'https://benchlot.com/login'
  };
  
  console.log('Template data being sent:', JSON.stringify(dynamicTemplateData, null, 2));
  
  try {
    // Create the email with template
    const msg = {
      to: TEST_EMAIL,
      from: SENDER_EMAIL,
      templateId: WELCOME_TEMPLATE_ID,
      dynamicTemplateData: dynamicTemplateData,
    };
    
    // Send the email
    await sgMail.send(msg);
    console.log('✅ Template email sent successfully!');
    console.log('Check your inbox for the test email.');
    console.log('The email should appear to be from:', SENDER_EMAIL);
    console.log('Variables sent to template:');
    console.log('- first_name:', dynamicTemplateData.first_name);
    console.log('- login_link:', dynamicTemplateData.login_link);
  } catch (error) {
    console.error('❌ Failed to send template email:');
    console.error(error);
    
    if (error.response) {
      console.error('Error response body:', error.response.body);
    }
    
    console.error('Please check your SendGrid configuration and template ID.');
  }
}

// Run the test
testTemplateEmail();