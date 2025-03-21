const express = require('express');
const stripe = require('../../utils/stripe');
const { supabase } = require('../../utils/supabaseClient');
const router = express.Router();

// Process Stripe webhooks
router.post('/', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle different event types
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
        
      // Add more event handlers as needed
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({received: true});
  } catch (err) {
    console.error(`Error handling webhook: ${err.message}`);
    res.status(500).send(`Webhook Error: ${err.message}`);
  }
});

// Handle successful payments
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Processing successful payment:', paymentIntent.id);
  
  // Get the order ID from metadata
  const orderId = paymentIntent.metadata.order_id;
  
  if (!orderId) {
    console.error('No order ID found in payment intent metadata');
    return;
  }
  
  // Update order status if needed
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: 'processing',
      payment_status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);
    
  if (orderError) {
    console.error('Failed to update order status:', orderError);
  }
  
  // Get order items to process transfers to sellers
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      tool_id,
      seller_id,
      price,
      quantity,
      tools (id, name)
    `)
    .eq('order_id', orderId);
    
  if (itemsError) {
    console.error('Failed to fetch order items:', itemsError);
    return;
  }
  
  // Process transfers to sellers
  const sellerMap = new Map();
  
  // Group items by seller
  orderItems.forEach(item => {
    const sellerId = item.seller_id;
    
    if (!sellerMap.has(sellerId)) {
      sellerMap.set(sellerId, {
        amount: 0,
        items: []
      });
    }
    
    const sellerData = sellerMap.get(sellerId);
    const itemTotal = item.price * item.quantity;
    sellerData.amount += itemTotal;
    sellerData.items.push(item);
  });
  
  // Create transfers for each seller
  for (const [sellerId, data] of sellerMap.entries()) {
    try {
      // Get seller's Stripe account ID
      const { data: seller, error: sellerError } = await supabase
        .from('users')
        .select('stripe_account_id')
        .eq('id', sellerId)
        .single();
        
      if (sellerError || !seller.stripe_account_id) {
        console.error('Failed to get seller Stripe account:', sellerError);
        continue;
      }
      
      // Calculate platform fee (5%)
      const platformFeePercent = 0.05;
      const amount = data.amount;
      const platformFee = Math.round(amount * platformFeePercent * 100) / 100;
      const sellerAmount = amount - platformFee;
      
      // Create a transfer to the seller
      const transfer = await stripe.transfers.create({
        amount: Math.round(sellerAmount * 100), // Convert to cents
        currency: 'usd',
        destination: seller.stripe_account_id,
        transfer_group: `order_${orderId}`,
        source_transaction: paymentIntent.charges.data[0].id,
        metadata: {
          order_id: orderId,
          seller_id: sellerId
        }
      });
      
      // Record the transfer in the database
      const { error: payoutError } = await supabase
        .from('seller_payouts')
        .insert({
          seller_id: sellerId,
          order_id: orderId,
          amount: sellerAmount,
          platform_fee: platformFee,
          stripe_transfer_id: transfer.id,
          status: 'completed',
          created_at: new Date().toISOString()
        });
        
      if (payoutError) {
        console.error('Failed to record seller payout:', payoutError);
      }
    } catch (error) {
      console.error(`Failed to create transfer to seller ${sellerId}:`, error);
    }
  }
}

// Handle failed payments
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Processing failed payment:', paymentIntent.id);
  
  // Get the order ID from metadata
  const orderId = paymentIntent.metadata.order_id;
  
  if (!orderId) {
    console.error('No order ID found in payment intent metadata');
    return;
  }
  
  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: 'payment_failed',
      payment_status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);
    
  if (orderError) {
    console.error('Failed to update order status:', orderError);
  }
}

// Handle account updates (for seller onboarding)
async function handleAccountUpdated(account) {
  console.log('Processing account update:', account.id);
  
  // Find the user with this Stripe account ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_account_id', account.id)
    .single();
    
  if (userError) {
    console.error('Failed to find user with Stripe account:', userError);
    return;
  }
  
  // Determine if the account is fully onboarded
  const isOnboarded = 
    account.details_submitted && 
    account.charges_enabled && 
    account.payouts_enabled;
  
  // Update the user record
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      stripe_account_status: isOnboarded ? 'active' : 'pending',
      stripe_account_details_submitted: account.details_submitted,
      is_seller: isOnboarded // Auto-activate seller status
    })
    .eq('id', user.id);
    
  if (updateError) {
    console.error('Failed to update user seller status:', updateError);
  }
}

module.exports = router;