// Comprehensive test script for all email types
require('dotenv').config(); // Load environment variables
const emailService = require('./emailService').default;

// Your actual email address for testing
const TEST_EMAIL = 'rob@benchlot.com';
const SENDER_EMAIL = 'notifications@benchlot.com';

async function testAllEmailTypes() {
  console.log('Testing all email types...');
  console.log(`All emails will be sent from ${SENDER_EMAIL} to ${TEST_EMAIL}`);
  
  // Keep track of successes and failures
  const results = {
    success: [],
    failure: []
  };
  
  try {
    // 1. Account Creation Email
    console.log('\nTesting Account Creation Email...');
    const accountCreationResult = await emailService.sendAccountCreationEmail(
      TEST_EMAIL,
      'Robert'
    );
    
    if (accountCreationResult.success) {
      console.log('✅ Account Creation email sent successfully!');
      results.success.push('Account Creation');
    } else {
      console.error('❌ Failed to send Account Creation email:', accountCreationResult.error);
      results.failure.push('Account Creation');
    }
    
    // 2. Password Reset Email
    console.log('\nTesting Password Reset Email...');
    const passwordResetResult = await emailService.sendPasswordResetEmail(
      TEST_EMAIL,
      'https://benchlot.com/reset-password?token=test-token'
    );
    
    if (passwordResetResult.success) {
      console.log('✅ Password Reset email sent successfully!');
      results.success.push('Password Reset');
    } else {
      console.error('❌ Failed to send Password Reset email:', passwordResetResult.error);
      results.failure.push('Password Reset');
    }
    
    // 3. Listing Published Email
    console.log('\nTesting Listing Published Email...');
    const listingPublishedResult = await emailService.sendListingPublishedEmail(
      TEST_EMAIL,
      {
        title: 'DeWalt Table Saw',
        price: 499.99,
        image: 'https://benchlot.com/images/tool123.jpg',
        id: 'tool-123'
      }
    );
    
    if (listingPublishedResult.success) {
      console.log('✅ Listing Published email sent successfully!');
      results.success.push('Listing Published');
    } else {
      console.error('❌ Failed to send Listing Published email:', listingPublishedResult.error);
      results.failure.push('Listing Published');
    }
    
    // 4. Message Received Email
    console.log('\nTesting Message Received Email...');
    const messageReceivedResult = await emailService.sendMessageReceivedEmail(
      TEST_EMAIL,
      {
        senderName: 'Jane Smith',
        messageText: 'Hi, I\'m interested in your table saw. Is it still available?',
        senderId: 'user-456'
      }
    );
    
    if (messageReceivedResult.success) {
      console.log('✅ Message Received email sent successfully!');
      results.success.push('Message Received');
    } else {
      console.error('❌ Failed to send Message Received email:', messageReceivedResult.error);
      results.failure.push('Message Received');
    }
    
    // 5. Offer Received Email
    console.log('\nTesting Offer Received Email...');
    const offerReceivedResult = await emailService.sendOfferReceivedEmail(
      TEST_EMAIL,
      {
        buyerName: 'John Doe',
        listingTitle: 'DeWalt Table Saw',
        offerAmount: 399.99,
        listingPrice: 499.99,
        offerId: 'offer-789'
      }
    );
    
    if (offerReceivedResult.success) {
      console.log('✅ Offer Received email sent successfully!');
      results.success.push('Offer Received');
    } else {
      console.error('❌ Failed to send Offer Received email:', offerReceivedResult.error);
      results.failure.push('Offer Received');
    }
    
    // 6. Offer Update Email
    console.log('\nTesting Offer Update Email...');
    const offerUpdateResult = await emailService.sendOfferUpdateEmail(
      TEST_EMAIL,
      {
        sellerName: 'Mike Johnson',
        listingTitle: 'DeWalt Table Saw',
        status: 'accepted',
        offerAmount: 399.99,
        counterOffer: null,
        listingId: 'tool-123'
      }
    );
    
    if (offerUpdateResult.success) {
      console.log('✅ Offer Update email sent successfully!');
      results.success.push('Offer Update');
    } else {
      console.error('❌ Failed to send Offer Update email:', offerUpdateResult.error);
      results.failure.push('Offer Update');
    }
    
    // Summary
    console.log('\n------------------------------------');
    console.log('EMAIL TESTING SUMMARY');
    console.log('------------------------------------');
    console.log(`Successful: ${results.success.length} emails`);
    results.success.forEach(type => console.log(`  ✅ ${type}`));
    
    console.log(`\nFailed: ${results.failure.length} emails`);
    results.failure.forEach(type => console.log(`  ❌ ${type}`));
    
    console.log('\nCheck your inbox for all test emails.');
    console.log('Note: All emails require properly set up SendGrid templates with the correct template IDs.');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testAllEmailTypes();