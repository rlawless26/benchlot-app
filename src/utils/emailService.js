// Client-side email service that forwards requests to the server
// This avoids importing SendGrid directly in the client code

// Base API URL - use relative path for both environments for consistency
const API_URL = '/api/email';

// Generic request helper function
const sendRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error);
    return { success: false, error };
  }
};

// Authentication Emails
export const sendVerificationEmail = (to, verificationLink) => {
  return sendRequest('verification', { 
    email: to, 
    verificationLink 
  });
};

export const sendPasswordResetEmail = (to, resetLink) => {
  return sendRequest('password-reset', { 
    email: to, 
    resetLink 
  });
};

export const sendAccountCreationEmail = (to, firstName) => {
  return sendRequest('account-creation', { 
    email: to, 
    firstName: firstName || to.split('@')[0]
  });
};

// Seller Emails
export const sendListingPublishedEmail = (to, listingDetails) => {
  return sendRequest('listing-published', {
    email: to,
    listingDetails: {
      title: listingDetails.title,
      price: listingDetails.price,
      image: listingDetails.image,
      id: listingDetails.id
    }
  });
};

export const sendMessageReceivedEmail = (to, messageDetails) => {
  return sendRequest('message-received', {
    email: to,
    messageDetails: {
      senderName: messageDetails.senderName,
      messageText: messageDetails.messageText,
      senderId: messageDetails.senderId
    }
  });
};

export const sendOfferReceivedEmail = (to, offerDetails) => {
  return sendRequest('offer-received', {
    email: to,
    offerDetails: {
      buyerName: offerDetails.buyerName,
      listingTitle: offerDetails.listingTitle,
      offerAmount: offerDetails.offerAmount,
      listingPrice: offerDetails.listingPrice,
      offerId: offerDetails.offerId
    }
  });
};

// Test function for verifying email setup
export const sendTestEmail = (to) => {
  return sendRequest('test', { email: to });
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountCreationEmail,
  sendListingPublishedEmail,
  sendMessageReceivedEmail,
  sendOfferReceivedEmail,
  sendTestEmail
};