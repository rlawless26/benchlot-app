# SendGrid Email Diagnostics

This document provides guidance for diagnosing and resolving SendGrid email issues in the Benchlot application.

## Common Issues

1. **405 Method Not Allowed Error**: The API endpoint exists but doesn't accept the request method.
   - Check server routing configuration
   - Ensure Express is handling POST routes correctly
   - Verify CORS preflight OPTIONS requests are handled

2. **406 Not Acceptable Error**: Content negotiation failed.
   - Check Accept header in requests
   - Ensure server can respond with requested content type
   - Common with Stripe and Supabase requests

3. **SyntaxError: The string did not match the expected pattern**: Invalid JSON response.
   - Server might be returning HTML error page instead of JSON
   - Possible that API endpoint doesn't exist or returns non-JSON

4. **Authentication Errors**: Issues with SendGrid API key.
   - Verify API key is set correctly in environment
   - Check that API key has proper permissions
   - Ensure sender email is verified in SendGrid

## Diagnostic Tools

These tools can help diagnose issues with SendGrid email integration:

### 1. Basic SendGrid Test (`test-sendgrid.js`)

Tests basic SendGrid email sending without templates:

```bash
# Run from the server directory
node test-sendgrid.js [recipient-email]
```

### 2. Template Test (`test-sendgrid-template.js`)

Tests SendGrid templates specifically:

```bash
# Run from the server directory
node test-sendgrid-template.js [recipient-email] [template-name]

# Available templates:
# - listing-published (default)
# - account-creation
# - message-received
# - test
```

### 3. SendGrid Diagnostic Server (`diagnose-sendgrid.js`)

A standalone diagnostic server for comprehensive testing:

```bash
# Run from the server directory
node diagnose-sendgrid.js
```

Then access these endpoints:
- `GET /env` - Check environment variables
- `GET /templates` - List template IDs
- `POST /send-test` - Send basic test email
- `POST /send-template` - Test template email

### 4. Production API Checker (`prod-api-check.js`)

Simulates client-side API calls to test production endpoints:

```bash
# Run from the server directory
node prod-api-check.js
```

This tests all relevant API endpoints with different HTTP methods.

## Production Deployment Checklist

When deploying to production, verify:

1. **Environment Variables**:
   - `SENDGRID_API_KEY` is set correctly
   - `FRONTEND_URL` points to the correct production URL

2. **API Routing**:
   - API routes are correctly configured
   - Express routes handle POST and OPTIONS requests
   - CORS middleware is configured correctly

3. **SendGrid Configuration**:
   - All templates exist in SendGrid account
   - Sender identity `notifications@benchlot.com` is verified
   - API key has proper permissions

4. **Server Logging**:
   - Check server logs for errors
   - Look for 4xx and 5xx errors in request logs

## Troubleshooting Steps

If emails are not being sent in production:

1. Use `prod-api-check.js` to identify which endpoints are failing
2. Check server logs for detailed error messages
3. Verify the SendGrid API key using `test-sendgrid.js` directly on the production server
4. Test templates using `test-sendgrid-template.js` on the production server
5. Check that the server's Express routes are handling POST requests correctly
6. Verify CORS configuration is allowing the necessary headers and methods

## Technical Reference

### SendGrid Template IDs

These are the current template IDs configured in the application:

- `PASSWORD_RESET`: d-7d448b96ded74ce0a278267611e7ac4c
- `ACCOUNT_CREATION`: d-280057e931044ee2ac3cce7d54a216e3
- `LISTING_PUBLISHED`: d-55c66b37ad7243c4a2a0ee6630b01922
- `MESSAGE_RECEIVED`: d-0f5098870f9b45b695e9d63274c65e54
- `OFFER_RECEIVED`: d-daa56a7c83dd49cc9ad18f47db974f11
- `MESSAGE_SENT`: d-f0ea3c88e645461eb4d8f2a5d0d8de1c
- `OFFER_UPDATE`: d-d9c87f7c3a8946b0b2dc6059a5e6b3cc

### API Endpoints

The following endpoints are used for email functionality:

- **GET /api/email/test-connection**: Verifies API connectivity and environment config
- **POST /api/email/listing-published**: Sends notification when a new listing is published
- **POST /api/email/account-creation**: Sends welcome email to new users
- **POST /api/email/password-reset**: Sends password reset links
- **POST /api/email/message-received**: Notifies users of new messages
- **POST /api/email/offer-received**: Notifies sellers of new offers
- **POST /api/email/offer-update**: Notifies buyers of offer responses
- **POST /api/email/message-sent**: Confirms message sending
- **POST /api/email/test**: Test endpoint for basic email sending