// Example template IDs - Replace these with your actual SendGrid template IDs
const TEMPLATE_IDS = {
  VERIFICATION: 'd-abc123def456', // Email verification template ID
  PASSWORD_RESET: 'd-abc123def456', // Password reset template ID
  ACCOUNT_CREATION: 'd-abc123def456', // Welcome email template ID
  LISTING_PUBLISHED: 'd-abc123def456', // Listing published confirmation template ID
  MESSAGE_RECEIVED: 'd-abc123def456', // New message notification template ID
  OFFER_RECEIVED: 'd-abc123def456', // New offer notification template ID
  PRODUCT_SOLD: 'd-abc123def456', // Product sold notification template ID
  SHIP_REMINDER: 'd-abc123def456', // Shipping reminder template ID
  PAYOUT_PROCESSED: 'd-abc123def456', // Payout notification template ID
  ORDER_CONFIRMATION: 'd-abc123def456', // Order confirmation template ID
  PAYMENT_CONFIRMATION: 'd-abc123def456', // Payment confirmation template ID
  SHIPPING_CONFIRMATION: 'd-abc123def456', // Shipping confirmation template ID
  MESSAGE_SENT: 'd-abc123def456', // Message sent confirmation template ID
  OFFER_UPDATE: 'd-abc123def456' // Offer status update template ID
};

// After creating your templates in SendGrid, replace this file with your actual IDs
// And update emailService.js to use your template IDs

module.exports = TEMPLATE_IDS;