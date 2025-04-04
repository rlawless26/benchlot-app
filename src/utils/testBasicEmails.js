// Basic email test script without templates
require('dotenv').config(); // Load environment variables
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

// Your actual email address for testing
const TEST_EMAIL = 'rob@benchlot.com';
const SENDER_EMAIL = 'notifications@benchlot.com';

async function testBasicEmails() {
  console.log('Testing basic email functionality...');
  console.log(`Sending emails from ${SENDER_EMAIL} to ${TEST_EMAIL}`);
  
  // Test emails to send
  const emailTypes = [
    {
      subject: 'Welcome to Benchlot',
      text: 'Thank you for creating an account with Benchlot. We\'re excited to have you join our community of tool enthusiasts!',
      html: '<h1>Welcome to Benchlot!</h1><p>Thank you for creating an account with Benchlot. We\'re excited to have you join our community of tool enthusiasts!</p>'
    },
    {
      subject: 'Password Reset Request',
      text: 'You requested to reset your password. Click this link to create a new password: https://benchlot.com/reset-password?token=test',
      html: '<h1>Reset Your Password</h1><p>You requested to reset your password. <a href="https://benchlot.com/reset-password?token=test">Click here</a> to create a new password.</p>'
    },
    {
      subject: 'Your Listing is Now Live: DeWalt Table Saw',
      text: 'Your listing for "DeWalt Table Saw" is now live on Benchlot. View your listing at: https://benchlot.com/tool/12345',
      html: '<h1>Your Listing is Now Live!</h1><p>Your listing for "DeWalt Table Saw" is now live on Benchlot. <a href="https://benchlot.com/tool/12345">View your listing here</a>.</p>'
    },
    {
      subject: 'New Message from John Smith',
      text: 'You have a new message from John Smith: "Hi, I\'m interested in your table saw. Is it still available?"',
      html: '<h1>New Message</h1><p>You have a new message from John Smith:</p><blockquote>"Hi, I\'m interested in your table saw. Is it still available?"</blockquote>'
    },
    {
      subject: 'New Offer on Your DeWalt Table Saw',
      text: 'John Smith has made an offer of $399.99 on your DeWalt Table Saw (listed at $499.99).',
      html: '<h1>New Offer</h1><p>John Smith has made an offer of <strong>$399.99</strong> on your DeWalt Table Saw (listed at $499.99).</p>'
    }
  ];
  
  // Results tracking
  const results = {
    success: [],
    failure: []
  };
  
  // Send each email
  for (let i = 0; i < emailTypes.length; i++) {
    const emailType = emailTypes[i];
    console.log(`\nSending email ${i + 1}: ${emailType.subject}...`);
    
    try {
      const msg = {
        to: TEST_EMAIL,
        from: SENDER_EMAIL,
        subject: emailType.subject,
        text: emailType.text,
        html: emailType.html
      };
      
      await sgMail.send(msg);
      console.log(`✅ Email "${emailType.subject}" sent successfully!`);
      results.success.push(emailType.subject);
    } catch (error) {
      console.error(`❌ Failed to send email "${emailType.subject}":`, error);
      results.failure.push(emailType.subject);
    }
  }
  
  // Print summary
  console.log('\n-------------------------------');
  console.log('EMAIL TEST SUMMARY');
  console.log('-------------------------------');
  console.log(`Successful: ${results.success.length} emails`);
  results.success.forEach(subject => console.log(`  ✅ ${subject}`));
  
  console.log(`\nFailed: ${results.failure.length} emails`);
  results.failure.forEach(subject => console.log(`  ❌ ${subject}`));
  
  console.log('\nCheck your inbox for all test emails.');
}

// Run the test
testBasicEmails();