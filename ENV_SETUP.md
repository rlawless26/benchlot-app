# Benchlot Environment Setup Guide

This document explains how environment variables are set up in the Benchlot application.

## Local Development Environment

### Client-Side Environment Variables

For the React frontend (client-side), environment variables are managed by Create React App:

1. `.env` - Base template file with placeholders (committed to Git)
2. `.env.local` - Development values that override `.env` (not committed to Git)

**Important**: All client-side environment variables must be prefixed with `REACT_APP_` to be accessible in the browser.

### Server-Side Environment Variables

For the Express server (server-side):

1. `server/.env` - Contains server-specific environment variables

## How It Works

- When you run `npm run dev-clean`, both the client and server start:
  - Client reads from `.env` and `.env.local`
  - Server reads from `server/.env`

## Development vs. Production

### Development

In development, we use:
- `.env.local` for client environment variables
- `server/.env` for server environment variables

### Production (Vercel)

In production:
1. Set all environment variables in Vercel's project settings
2. No need for `.env.local` or `server/.env` files in production

## Fixing the 406 Error

The 406 Not Acceptable errors from Supabase are related to header acceptance issues. We've fixed this by:

1. Configuring the Supabase client with proper headers for both client and server
2. Setting explicit content and accept headers
3. Ensuring environment variables are properly loaded in both contexts

## Environment Variables Reference

### Client-Side Variables (in .env.local)

```
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://tavhowcenicgowmdmbcz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon-key>

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=<publishable-key>

# URLs for development
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:3001
```

### Server-Side Variables (in server/.env)

```
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://tavhowcenicgowmdmbcz.supabase.co
SUPABASE_SERVICE_KEY=<service-key>

# Stripe Configuration
STRIPE_SECRET_KEY=<secret-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>

# SendGrid Configuration
SENDGRID_API_KEY=<sendgrid-api-key>

# URLs
FRONTEND_URL=http://localhost:3000
```

## Production Variables (in Vercel)

When deploying to production, add all these variables to Vercel, changing URL values to point to production.

## Troubleshooting

If you encounter environment variable issues:

1. Check if variables are being correctly loaded with console logs
2. Make sure you're using the correct prefix (`REACT_APP_` for client, no prefix for server)
3. Restart both client and server with `npm run dev-clean`

For Supabase 406 errors:
- These are typically related to content negotiation and headers
- Our fix sets proper Accept headers to resolve these issues