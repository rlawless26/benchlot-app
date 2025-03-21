const express = require('express');
const stripe = require('../../utils/stripe');
const { supabase } = require('../../utils/supabaseClient');
const router = express.Router();

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { cartItems, customerId, paymentMethodId } = req.body;
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate amounts
    let totalAmount = 0;
    const itemsBySellerMap = new Map();
    
    // Group items by seller and calculate totals
    for (const item of cartItems) {
      totalAmount += item.price * item.quantity;
      
      // Get the seller ID for this tool
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .select('seller_id')
        .eq('id', item.tool_id)
        .single();
        
      if (toolError) {
        return res.status(400).json({ error: 'Error fetching tool information' });
      }
      
      const sellerId = tool.seller_id;
      
      if (!itemsBySellerMap.has(sellerId)) {
        itemsBySellerMap.set(sellerId, {
          amount: 0,
          items: []
        });
      }
      
      const sellerData = itemsBySellerMap.get(sellerId);
      sellerData.amount += item.price * item.quantity;
      sellerData.items.push(item);
    }
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents and ensure it's an integer
      currency: 'usd',
      payment_method: paymentMethodId,
      customer: customerId,
      metadata: {
        order_id: `order_${Date.now()}`, // We'll update this with the real ID later
      },
      transfer_group: `order_${Date.now()}`, // Used to group transfers to sellers
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment and create order
router.post('/confirm-payment', async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      cartItems, 
      userId, 
      shippingDetails 
    } = req.body;
    
    // Retrieve the payment intent to verify payment status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }
    
    // Begin database transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: paymentIntent.amount / 100, // Convert from cents
        payment_intent_id: paymentIntentId,
        status: 'paid',
        shipping_address: shippingDetails,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (orderError) {
      return res.status(500).json({ error: 'Failed to create order' });
    }
    
    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      tool_id: item.tool_id,
      quantity: item.quantity,
      price: item.price,
      seller_id: item.seller_id,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      return res.status(500).json({ error: 'Failed to create order items' });
    }
    
    // Update the payment intent with the real order ID
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { order_id: order.id }
    });
    
    // Clear the user's cart
    const { error: cartError } = await supabase
      .from('carts')
      .delete()
      .eq('user_id', userId);
      
    if (cartError) {
      console.error('Failed to clear cart:', cartError);
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;