const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Template IDs - actual template IDs from SendGrid
const TEMPLATE_IDS = {
  VERIFICATION: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  PASSWORD_RESET: 'd-7d448b96ded74ce0a278267611e7ac4c',
  ACCOUNT_CREATION: 'd-280057e931044ee2ac3cce7d54a216e3',
  LISTING_PUBLISHED: 'd-55c66b37ad7243c4a2a0ee6630b01922',
  MESSAGE_RECEIVED: 'd-0f5098870f9b45b695e9d63274c65e54',
  OFFER_RECEIVED: 'd-daa56a7c83dd49cc9ad18f47db974f11',
  PRODUCT_SOLD: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  SHIP_REMINDER: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  PAYOUT_PROCESSED: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  ORDER_CONFIRMATION: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  PAYMENT_CONFIRMATION: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  SHIPPING_CONFIRMATION: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  MESSAGE_SENT: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  OFFER_UPDATE: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
};

// Base email sender function
const sendEmail = async (to, templateId, dynamicTemplateData, from = 'notifications@benchlot.com') => {
  // Add timestamp for debugging purposes
  console.log(`[${new Date().toISOString()}] Attempting to send email to ${to} using template ${templateId}`);
  console.log('Template data:', JSON.stringify(dynamicTemplateData));
  console.log('Environment variables:');
  console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- SENDGRID_API_KEY set:', !!process.env.SENDGRID_API_KEY);
  
  // Validate template ID exists
  if (!templateId) {
    console.error('ERROR: Template ID is missing or undefined');
    return { success: false, error: { message: 'Missing template ID' } };
  }
  
  // Validate recipient email
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    console.error('ERROR: Invalid recipient email address:', to);
    return { success: false, error: { message: 'Invalid recipient email' } };
  }
  
  const msg = {
    to,
    from,
    templateId,
    dynamicTemplateData,
  };
  
  try {
    console.log('Sending email with payload:', {
      to: msg.to,
      from: msg.from,
      templateId: msg.templateId,
      // Don't log full template data as it might contain sensitive info
      dataKeys: Object.keys(msg.dynamicTemplateData)
    });
    
    const response = await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to} using template ${templateId}`);
    console.log('SendGrid response:', response[0].statusCode);
    return { success: true };
  } catch (error) {
    console.error(`❌ SendGrid email error when sending to ${to}:`, error.toString());
    
    // More detailed error logging
    if (error.response) {
      console.error('SendGrid API response details:');
      console.error('- Status code:', error.response.statusCode);
      console.error('- Body:', JSON.stringify(error.response.body));
      console.error('- Headers:', JSON.stringify(error.response.headers));
    }
    
    // Check for common issues
    if (!process.env.SENDGRID_API_KEY) {
      console.error('CRITICAL ERROR: SENDGRID_API_KEY is not set in environment');
    }
    
    if (error.message && error.message.includes('unauthorized')) {
      console.error('AUTHORIZATION ERROR: SendGrid API key may be invalid or missing permissions');
    }
    
    if (error.message && error.message.includes('template')) {
      console.error(`TEMPLATE ERROR: Template ID ${templateId} may be invalid or not found`);
    }
    
    return { 
      success: false, 
      error: {
        message: error.message,
        statusCode: error.response?.statusCode,
        details: error.response?.body
      } 
    };
  }
};

// Authentication Emails
exports.sendVerificationEmail = (to, verificationLink) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.VERIFICATION, 
    { 
      verification_link: verificationLink,
      username: to.split('@')[0] // Simple username extraction
    }
  );
};

exports.sendPasswordResetEmail = (to, resetLink) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.PASSWORD_RESET, 
    { 
      reset_link: resetLink,
      username: to.split('@')[0]
    }
  );
};

exports.sendAccountCreationEmail = (to, firstName) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.ACCOUNT_CREATION, 
    { 
      first_name: firstName || to.split('@')[0],
      login_link: `${process.env.FRONTEND_URL}/login`
    }
  );
};

// Seller Emails
exports.sendListingPublishedEmail = (to, listingDetails) => {
  console.log('sendListingPublishedEmail called with:', {
    to,
    listingDetails
  });

  // Add fallback image if not provided
  const imageUrl = listingDetails.image || 'https://benchlot.com/images/placeholder-tool.jpg';
  
  // Create the listing URL
  const listingUrl = `${process.env.FRONTEND_URL}/tool/${listingDetails.id}`;
  
  console.log('Using template ID:', TEMPLATE_IDS.LISTING_PUBLISHED);
  console.log('Frontend URL from env:', process.env.FRONTEND_URL);
  console.log('Complete listing URL:', listingUrl);
  
  // Send the email with template data
  return sendEmail(
    to, 
    TEMPLATE_IDS.LISTING_PUBLISHED, 
    { 
      listing_title: listingDetails.title,
      listing_price: listingDetails.price,
      listing_image: imageUrl,
      listing_url: listingUrl
    }
  );
};

exports.sendMessageReceivedEmail = (to, messageDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.MESSAGE_RECEIVED, 
    { 
      sender_name: messageDetails.senderName,
      message_preview: messageDetails.messageText.substring(0, 100) + (messageDetails.messageText.length > 100 ? '...' : ''),
      message_url: `${process.env.FRONTEND_URL}/messages?contact=${messageDetails.senderId}`
    }
  );
};

exports.sendOfferReceivedEmail = (to, offerDetails) => {
  // Calculate discount percentage if both prices are provided
  let discountPercentage = 0;
  if (offerDetails.listingPrice && offerDetails.offerAmount) {
    discountPercentage = Math.round(((offerDetails.listingPrice - offerDetails.offerAmount) / offerDetails.listingPrice) * 100);
    discountPercentage = Math.max(0, discountPercentage); // Ensure it's not negative
  }

  return sendEmail(
    to, 
    TEMPLATE_IDS.OFFER_RECEIVED, 
    { 
      buyer_name: offerDetails.buyerName,
      listing_title: offerDetails.listingTitle,
      offer_amount: offerDetails.offerAmount,
      listing_price: offerDetails.listingPrice,
      discount_percentage: discountPercentage.toString(),
      offer_url: `${process.env.FRONTEND_URL}/seller/offers/${offerDetails.offerId}`
    }
  );
};

exports.sendProductSoldEmail = (to, orderDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.PRODUCT_SOLD, 
    { 
      buyer_name: orderDetails.buyerName,
      listing_title: orderDetails.listingTitle,
      order_amount: orderDetails.orderAmount,
      order_id: orderDetails.orderId,
      order_url: `${process.env.FRONTEND_URL}/seller/orders/${orderDetails.orderId}`
    }
  );
};

exports.sendShipReminderEmail = (to, orderDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.SHIP_REMINDER, 
    { 
      buyer_name: orderDetails.buyerName,
      listing_title: orderDetails.listingTitle,
      order_id: orderDetails.orderId,
      days_elapsed: orderDetails.daysElapsed,
      order_url: `${process.env.FRONTEND_URL}/seller/orders/${orderDetails.orderId}`
    }
  );
};

exports.sendPayoutProcessedEmail = (to, payoutDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.PAYOUT_PROCESSED, 
    { 
      payout_amount: payoutDetails.amount,
      bank_account: payoutDetails.bankLast4,
      estimated_arrival: payoutDetails.estimatedArrival,
      transaction_id: payoutDetails.transactionId,
      earnings_url: `${process.env.FRONTEND_URL}/seller/earnings`
    }
  );
};

// Buyer Emails
exports.sendOrderConfirmationEmail = (to, orderDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.ORDER_CONFIRMATION, 
    { 
      order_id: orderDetails.orderId,
      listing_title: orderDetails.listingTitle,
      order_amount: orderDetails.orderAmount,
      seller_name: orderDetails.sellerName,
      estimated_shipping: orderDetails.estimatedShipping,
      order_url: `${process.env.FRONTEND_URL}/orders/${orderDetails.orderId}`
    }
  );
};

exports.sendPaymentConfirmationEmail = (to, paymentDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.PAYMENT_CONFIRMATION, 
    { 
      order_id: paymentDetails.orderId,
      payment_amount: paymentDetails.amount,
      payment_method: paymentDetails.paymentMethod,
      order_url: `${process.env.FRONTEND_URL}/orders/${paymentDetails.orderId}`
    }
  );
};

exports.sendShippingConfirmationEmail = (to, shippingDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.SHIPPING_CONFIRMATION, 
    { 
      order_id: shippingDetails.orderId,
      listing_title: shippingDetails.listingTitle,
      tracking_number: shippingDetails.trackingNumber,
      tracking_url: shippingDetails.trackingUrl,
      carrier: shippingDetails.carrier,
      estimated_delivery: shippingDetails.estimatedDelivery,
      order_url: `${process.env.FRONTEND_URL}/orders/${shippingDetails.orderId}`
    }
  );
};

exports.sendMessageSentEmail = (to, messageDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.MESSAGE_SENT, 
    { 
      recipient_name: messageDetails.recipientName,
      message_preview: messageDetails.messageText.substring(0, 100) + (messageDetails.messageText.length > 100 ? '...' : ''),
      message_url: `${process.env.FRONTEND_URL}/messages?contact=${messageDetails.recipientId}`
    }
  );
};

exports.sendOfferUpdateEmail = (to, offerDetails) => {
  return sendEmail(
    to, 
    TEMPLATE_IDS.OFFER_UPDATE, 
    { 
      seller_name: offerDetails.sellerName,
      listing_title: offerDetails.listingTitle,
      status: offerDetails.status, // 'accepted' or 'rejected'
      offer_amount: offerDetails.offerAmount,
      counter_offer: offerDetails.counterOffer,
      next_steps: offerDetails.status === 'accepted' ? 'Proceed to checkout' : 'View other listings',
      action_url: offerDetails.status === 'accepted' ? 
        `${process.env.FRONTEND_URL}/checkout/${offerDetails.listingId}` : 
        `${process.env.FRONTEND_URL}/marketplace`
    }
  );
};

// Test function for verifying email setup
exports.sendTestEmail = (to) => {
  return sendEmail(
    to,
    TEMPLATE_IDS.ACCOUNT_CREATION, // Use any template you've created
    {
      first_name: 'Test User',
      login_link: `${process.env.FRONTEND_URL}/login`
    },
    'notifications@benchlot.com' // Explicitly set the sender email
  );
};