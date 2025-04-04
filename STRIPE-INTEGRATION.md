# Clean Stripe Integration for Benchlot

This document outlines a clean, production-ready approach to integrating Stripe into the Benchlot marketplace.

## Key Principles

1. **Simplicity**: Minimal, focused code that does exactly what's needed
2. **Resilience**: Handles edge cases and errors gracefully
3. **Separation of concerns**: Server-side business logic, client-side UI only
4. **Performance**: Avoids the header size issue by using query parameters instead of cookies/headers

## Implementation Steps

### Step 1: Testing the New Integration

1. Start the clean server:
   ```bash
   npm run dev-clean
   ```

2. Copy the cleaned components to their actual locations:
   ```bash
   cp src/Pages/SellerSignupPage.clean.jsx src/Pages/SellerSignupPage.jsx
   cp src/Pages/SellerOnboardingPage.clean.jsx src/Pages/SellerOnboardingPage.jsx
   ```

3. Test the signup flow:
   - Navigate to `/seller/signup`
   - Fill out the form and submit
   - Verify you're redirected to the Stripe onboarding page
   - Complete the test onboarding
   - Return to the dashboard

### Step 2: Full Integration

Once the core flow is verified, update these areas:

1. **Dashboard integration**:
   - Add a link to the Stripe dashboard for sellers
   - Display payout information

2. **Payment processing**:
   - Implement the buyer checkout flow
   - Set up payment intent creation
   - Implement transfers to sellers

3. **Webhooks**:
   - Set up Stripe webhooks for account updates
   - Set up payment status webhooks

## Troubleshooting

### Common Issues

1. **Account creation errors**:
   - Check logs for error details
   - Verify environment variables are set
   - Test with a different email address

2. **Onboarding link errors**:
   - Check that refresh_url and return_url are correctly set
   - Verify the account ID exists in Stripe

3. **Header size errors**:
   - The clean implementation should avoid this entirely
   - If they persist, check the frontend requests for unnecessary headers/cookies

## System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│   Browser   │────▶│   API Server│────▶│   Stripe    │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐           │
       │            │             │           │
       └────────────│   Supabase  │◀──────────┘
                    │             │
                    └─────────────┘
```

## Benefits of This Approach

1. **Minimal headers**: Using query parameters instead of cookies/headers for authentication
2. **Separation of concerns**: Server handles all Stripe logic, frontend just displays links
3. **Simplified error handling**: Clear error messages and resilient retry mechanisms
4. **Maintainability**: Clean, focused code that's easy to update
5. **Security**: No client-side Stripe secrets, proper validation

## Next Steps

After implementing core Connect functionality:

1. Create payment processing endpoints
2. Set up webhook handling
3. Implement buyer checkout flow
4. Set up platform fee calculations
5. Add reporting and analytics