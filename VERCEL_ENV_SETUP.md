# Vercel Environment Setup for Benchlot

This document contains all the environment variables that need to be configured in your Vercel project settings for Benchlot to function properly in production.

## Required Environment Variables

```
# Server Configuration
PORT=3001
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://tavhowcenicgowmdmbcz.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2NlbmljZ293bWRtYmN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTI0NTI3MiwiZXhwIjoyMDU0ODIxMjcyfQ._LQ7xOP2A2dWXy7moo9ocgupOHv3fVKHSztoq7jfZEc
REACT_APP_SUPABASE_URL=https://tavhowcenicgowmdmbcz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdmhvd2NlbmljZ293bWRtYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNDUyNzIsImV4cCI6MjA1NDgyMTI3Mn0.Mwp5XR3vuWB4hurNLvF-DoWzWxb4wSrp99qIhOqMEIA

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51R42hWA587cjIFxeo8UB9nUfHG1MOMjWtj2GuaUefqU5m2DlDU4R9EWknS17lxgg4yWBvzDKNPfgQw7al0BkJjlW00FGUVo8Hz
STRIPE_WEBHOOK_SECRET=whsec_7af149c8024c34e8f8d97623df26f1c81af67fa031be6efc92be5770ae431a22
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51R42hePJSOllkrGgz49d9Hz4brYMLWvGSRzkhcC5pzRaHakcqXTfOGxwHPXiIln111YS8gT4taztl7BPLeSqF7mS00RJbnMDhp

# SendGrid Configuration
SENDGRID_API_KEY=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

# URLs for production
FRONTEND_URL=https://benchlot.com
REACT_APP_FRONTEND_URL=https://benchlot.com
REACT_APP_API_URL=https://benchlot.com
```

## Important Notes

1. **Production URLs**: Ensure all URLs point to your production domain (`https://benchlot.com`).

2. **Stripe Keys**: Check if you need to use production Stripe keys instead of test keys for the production environment.

3. **SendGrid Verification**: Ensure the sender email (`notifications@benchlot.com`) is verified in your SendGrid account.

## After Deployment

After deploying with these environment variables:

1. Visit `https://benchlot.com/api/email/test-connection` to verify the API is working correctly
2. Check the logs in Vercel for any errors
3. Test creating a tool listing to verify email sending works

## Environment Variables Precedence

In a Vercel deployment:

1. Vercel environment variables override any values in your codebase
2. Only variables prefixed with `REACT_APP_` are accessible in the client-side code
3. All variables are accessible in the server-side code
