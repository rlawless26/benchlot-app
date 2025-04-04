# Stripe Connect Setup for Benchlot

This guide walks through setting up the Stripe Connect integration for Benchlot, which allows sellers to onboard and receive payments.

## Database Setup

1. Run the SQL script in Supabase's SQL Editor:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy the contents of `stripe_tokens_table.sql`
   - Run the script

## Environment Variables

Ensure these environment variables are set in your `.env` file:

```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:3001

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Testing the Flow

1. Start the server: `npm run server`
2. Navigate to `/seller/signup` in your browser
3. Fill out the form and submit
4. Click the "Complete Stripe Onboarding" button
5. You should be redirected to Stripe Connect onboarding

## Webhook Setup

For full functionality, set up Stripe webhooks:

1. Use the Stripe CLI for local testing:
   ```
   stripe listen --forward-to localhost:3001/api/stripe/webhooks
   ```

2. For production, set up a webhook in the Stripe Dashboard:
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhooks`
   - Select events:
     - `account.updated`
     - `account.application.authorized`
     - `account.application.deauthorized`

## Troubleshooting

If you encounter 431 errors:
- The token-based approach should prevent these errors
- If they persist, try clearing browser cookies
- Check header sizes in your server logs

## How It Works

1. User submits the seller signup form
2. Server creates a Stripe Connect account
3. Server generates a one-time token
4. Frontend builds a URL with this token
5. User clicks button to continue
6. Server validates token and redirects to Stripe
7. User completes Stripe onboarding
8. Stripe sends webhook with account updates
9. Server updates user's seller status

This flow avoids cookie/header issues by using one-time tokens instead of session cookies for the critical Stripe redirect.