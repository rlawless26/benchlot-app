require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const { TEMPLATE_IDS } = require('./emailService');

// Log environment setup
console.log('Environment:', process.env.NODE_ENV);
console.log('SendGrid API Key exists:', !!process.env.SENDGRID_API_KEY);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create a more complete test that matches the actual email flow
async function testListingPublishedEmail() {
  try {
    // Use the exact same format as the actual application
    const to = 'test@example.com'; // Change to your email for testing
    const listingDetails = {
      title: 'Test Tool Listing',
      price: 99.99,
      image: 'https://benchlot.com/images/placeholder-tool.jpg',
      id: '123456'
    };

    const msg = {
      to,
      from: 'notifications@benchlot.com',
      templateId: 'd-55c66b37ad7243c4a2a0ee6630b01922', // Listing published template ID
      dynamicTemplateData: { 
        listing_title: listingDetails.title,
        listing_price: listingDetails.price,
        listing_image: listingDetails.image,
        listing_url: `${process.env.FRONTEND_URL || 'https://benchlot.com'}/tool/${listingDetails.id}`
      }
    };

    console.log('Sending test email with payload:', JSON.stringify(msg, null, 2));
    
    const result = await sgMail.send(msg);
    console.log('Email sent successfully!');
    console.log('Response:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:');
    console.error(error.response ? error.response.body : error);
    return null;
  }
}

// Run the test
testListingPublishedEmail();