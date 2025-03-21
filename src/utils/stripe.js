import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// API functions to communicate with your backend
export const createPaymentIntent = async (cartItems, customerId, paymentMethodId) => {
  try {
    const response = await fetch('/api/stripe/payments/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartItems,
        customerId,
        paymentMethodId
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId, cartItems, userId, shippingDetails) => {
  try {
    const response = await fetch('/api/stripe/payments/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        cartItems,
        userId,
        shippingDetails
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const createConnectAccount = async (userId, email) => {
  try {
    const response = await fetch('/api/stripe/connect/create-connect-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating Connect account:', error);
    throw error;
  }
};

export const getConnectAccountStatus = async (userId) => {
  try {
    const response = await fetch(`/api/stripe/connect/account-status/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting Connect account status:', error);
    throw error;
  }
};

export const getConnectDashboardLink = async (userId) => {
  try {
    const response = await fetch(`/api/stripe/connect/dashboard-link/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting Connect dashboard link:', error);
    throw error;
  }
};