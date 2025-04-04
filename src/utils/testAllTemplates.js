// Comprehensive test script for all available template emails
require('dotenv').config(); // Load environment variables
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

// Your actual email address for testing
const TEST_EMAIL = 'rob@benchlot.com';
const SENDER_EMAIL = 'notifications@benchlot.com';

// Your actual template IDs from SendGrid
const TEMPLATE_IDS = {
  ACCOUNT_CREATION: 'd-280057e931044ee2ac3cce7d54a216e3',
  PASSWORD_RESET: 'd-7d448b96ded74ce0a278267611e7ac4c',
  LISTING_PUBLISHED: 'd-55c66b37ad7243c4a2a0ee6630b01922',
  MESSAGE_RECEIVED: 'd-0f5098870f9b45b695e9d63274c65e54',
  OFFER_RECEIVED: 'd-daa56a7c83dd49cc9ad18f47db974f11'
};

// Test all templates
async function testAllTemplates() {
  console.log('Testing all available SendGrid templates...');
  console.log(`Sending from: ${SENDER_EMAIL} to: ${TEST_EMAIL}`);
  
  // Track results
  const results = {
    success: [],
    failure: []
  };
  
  try {
    // 1. Account Creation Email
    console.log('\n1. Testing Account Creation Email...');
    try {
      const msg1 = {
        to: TEST_EMAIL,
        from: SENDER_EMAIL,
        templateId: TEMPLATE_IDS.ACCOUNT_CREATION,
        dynamicTemplateData: {
          first_name: 'Robert',
          login_link: 'https://benchlot.com/login'
        }
      };
      
      await sgMail.send(msg1);
      console.log('✅ Account Creation email sent successfully!');
      results.success.push('Account Creation');
    } catch (error) {
      console.error('❌ Failed to send Account Creation email:', error.message);
      results.failure.push('Account Creation');
    }
    
    // 2. Password Reset Email
    console.log('\n2. Testing Password Reset Email...');
    try {
      const msg2 = {
        to: TEST_EMAIL,
        from: SENDER_EMAIL,
        templateId: TEMPLATE_IDS.PASSWORD_RESET,
        dynamicTemplateData: {
          reset_link: 'https://benchlot.com/reset-password?token=test-token-12345',
          username: 'Robert'
        }
      };
      
      await sgMail.send(msg2);
      console.log('✅ Password Reset email sent successfully!');
      results.success.push('Password Reset');
    } catch (error) {
      console.error('❌ Failed to send Password Reset email:', error.message);
      results.failure.push('Password Reset');
    }
    
    // 3. Listing Published Email
    console.log('\n3. Testing Listing Published Email...');
    try {
      const msg3 = {
        to: TEST_EMAIL,
        from: SENDER_EMAIL,
        templateId: TEMPLATE_IDS.LISTING_PUBLISHED,
        dynamicTemplateData: {
          listing_title: 'DeWalt Table Saw',
          listing_price: '499.99',
          listing_image: 'https://benchlot.com/images/placeholder-tool.jpg',
          listing_url: 'https://benchlot.com/tool/123456'
        }
      };
      
      await sgMail.send(msg3);
      console.log('✅ Listing Published email sent successfully!');
      results.success.push('Listing Published');
    } catch (error) {
      console.error('❌ Failed to send Listing Published email:', error.message);
      results.failure.push('Listing Published');
    }
    
    // 4. Message Received Email
    console.log('\n4. Testing Message Received Email...');
    try {
      const msg4 = {
        to: TEST_EMAIL,
        from: SENDER_EMAIL,
        templateId: TEMPLATE_IDS.MESSAGE_RECEIVED,
        dynamicTemplateData: {
          sender_name: 'Jane Smith',
          message_preview: 'Hi, I\'m interested in your table saw. Is it still available?',
          message_url: 'https://benchlot.com/messages?contact=user-456'
        }
      };
      
      await sgMail.send(msg4);
      console.log('✅ Message Received email sent successfully!');
      results.success.push('Message Received');
    } catch (error) {
      console.error('❌ Failed to send Message Received email:', error.message);
      results.failure.push('Message Received');
    }
    
    // 5. Offer Received Email
    console.log('\n5. Testing Offer Received Email...');
    try {
      const msg5 = {
        to: TEST_EMAIL,
        from: SENDER_EMAIL,
        templateId: TEMPLATE_IDS.OFFER_RECEIVED,
        dynamicTemplateData: {
          buyer_name: 'John Doe',
          listing_title: 'DeWalt Table Saw',
          offer_amount: '399.99',
          listing_price: '499.99',
          discount_percentage: '20',
          offer_url: 'https://benchlot.com/seller/offers/789'
        }
      };
      
      await sgMail.send(msg5);
      console.log('✅ Offer Received email sent successfully!');
      results.success.push('Offer Received');
    } catch (error) {
      console.error('❌ Failed to send Offer Received email:', error.message);
      results.failure.push('Offer Received');
    }
    
    // Print summary
    console.log('\n-------------------------------');
    console.log('TEMPLATE EMAIL TEST SUMMARY');
    console.log('-------------------------------');
    console.log(`Successful: ${results.success.length} emails`);
    results.success.forEach(name => console.log(`  ✅ ${name}`));
    
    console.log(`\nFailed: ${results.failure.length} emails`);
    results.failure.forEach(name => console.log(`  ❌ ${name}`));
    
    console.log('\nCheck your inbox for the test emails.');
    console.log('If any tests failed, check the template variables and make sure they match what\'s in your SendGrid templates.');
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testAllTemplates();