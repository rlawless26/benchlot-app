// Simple script to test SendGrid implementation directly
require('dotenv').config();

// using Twilio SendGrid's v3 Node.js Library
const sgMail = require('@sendgrid/mail');

// Validate environment
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
console.log('- SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length || 0);

if (!process.env.SENDGRID_API_KEY) {
  console.error('ERROR: SENDGRID_API_KEY is not set in environment!');
  process.exit(1);
}

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Who to send to - defaults to robertlawless@protonmail.com if not provided
const recipient = process.argv[2] || 'robertlawless@protonmail.com';
console.log(`Will send test email to: ${recipient}`);

const msg = {
  to: recipient,
  from: 'notifications@benchlot.com', // Must be your verified sender in SendGrid
  subject: 'Benchlot SendGrid Test Email',
  text: 'This is a test email to verify SendGrid integration with Benchlot',
  html: `
    <h1>Benchlot SendGrid Test</h1>
    <p>This is a test email sent at ${new Date().toLocaleString()}</p>
    <p>If you're seeing this, your SendGrid integration is working correctly!</p>
    <p><strong>Next steps:</strong></p>
    <ul>
      <li>Check your template IDs in SendGrid</li>
      <li>Verify your API endpoint routing in production</li>
      <li>Ensure CORS is configured correctly</li>
    </ul>
  `,
}

// Send the email
console.log('Sending test email...');
sgMail
  .send(msg)
  .then((response) => {
    console.log('SUCCESS! Email sent');
    console.log('Status code:', response[0].statusCode);
    console.log('Headers:', response[0].headers);
  })
  .catch((error) => {
    console.error('ERROR! Failed to send email:');
    console.error(error);
    
    if (error.response) {
      console.error('SendGrid API Response:');
      console.error('Status code:', error.response.statusCode);
      console.error('Body:', error.response.body);
      console.error('Headers:', error.response.headers);
    }
  });