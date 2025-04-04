require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key directly
const apiKey = process.env.SENDGRID_API_KEY;
console.log('Using API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');
sgMail.setApiKey(apiKey);

// Log env variables
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Create a simple test message
const msg = {
  to: 'test@example.com', // Change to your email for testing
  from: 'notifications@benchlot.com',
  subject: 'SendGrid Test Email',
  text: 'This is a test email from SendGrid via Node.js',
  html: '<strong>This is a test email from SendGrid via Node.js</strong>',
};

// Send the test email
sgMail.send(msg)
  .then(() => {
    console.log('Test email sent successfully!');
  })
  .catch((error) => {
    console.error('Error sending test email:');
    console.error(error.response ? error.response.body : error);
  });
