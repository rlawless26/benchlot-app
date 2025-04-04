require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Log all environment variables starting with SENDGRID or FRONTEND
console.log('Environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('SENDGRID') || key.includes('FRONTEND')) {
    console.log(`${key}: ${key.includes('KEY') ? '***' : process.env[key]}`);
  }
});

// Check if email sender is verified
async function checkSenderVerification() {
  try {
    const client = require('@sendgrid/client');
    client.setApiKey(process.env.SENDGRID_API_KEY);
    
    // List verified senders
    const request = {
      method: 'GET',
      url: '/v3/verified_senders',
    };
    
    console.log('Checking verified senders...');
    const [response] = await client.request(request);
    
    console.log('Response status:', response.statusCode);
    console.log('Verified senders:', JSON.stringify(response.body, null, 2));
    
    // Check for the specific email
    const notificationEmail = 'notifications@benchlot.com';
    const isVerified = response.body.results.some(sender => 
      sender.from_email.toLowerCase() === notificationEmail.toLowerCase()
    );
    
    console.log(`\nIs ${notificationEmail} verified? ${isVerified ? 'Yes' : 'No'}`);
    
    if (!isVerified) {
      console.log('\nThis could be the reason emails are not being sent. The sender email must be verified in SendGrid.');
    }
  } catch (error) {
    console.error('Error checking sender verification:');
    console.error(error.response?.body || error);
  }
}

checkSenderVerification();