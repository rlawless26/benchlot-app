# SendGrid Email Fixes for Production

## Issues Identified

After thorough testing, we've identified several issues that are preventing SendGrid emails from being sent in production:

1. **Environment Variable Configuration**
   - Inconsistent `FRONTEND_URL` between client and server
   - SendGrid API key may not be properly set in production

2. **SendGrid Configuration**
   - `notifications@benchlot.com` sender email may not be verified
   - API key permissions may be insufficient

3. **API Endpoint Configuration**
   - Client-side API path doesn't match server configuration in production
   - 431 Request Header Fields Too Large errors when testing endpoints

## Fix Implementation

### 1. Verify Environment Variables in Vercel

Add these critical environment variables to your Vercel project settings:

```
SENDGRID_API_KEY=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
FRONTEND_URL=https://benchlot.com
```

### 2. Verify SendGrid Sender Identity

1. Log in to your SendGrid account
2. Go to Settings > Sender Authentication
3. Verify that `notifications@benchlot.com` is verified
4. If not, add and verify this email address

### 3. Update Client-Side Email Service

Update the client-side API URL to be consistently relative in both environments:

```javascript
// src/utils/emailService.js
const API_URL = '/api/email'; // Use relative path for both environments
```

### 4. Add Console Logging for Debugging

Add more comprehensive logging to help diagnose issues in production:

```javascript
// server/api/email/index.js - add to listing-published endpoint
console.log('Received listing-published request:', {
  email: req.body.email,
  listingDetails: req.body.listingDetails
});

// server/utils/emailService.js - enhance sendEmail function
const sendEmail = async (to, templateId, dynamicTemplateData, from = 'notifications@benchlot.com') => {
  console.log(`Attempting to send email to ${to} using template ${templateId}`);
  console.log('Template data:', JSON.stringify(dynamicTemplateData));
  
  const msg = {
    to,
    from,
    templateId,
    dynamicTemplateData,
  };
  
  try {
    const response = await sgMail.send(msg);
    console.log(`Email sent successfully to ${to} using template ${templateId}`);
    console.log('SendGrid response:', response[0].statusCode);
    return { success: true };
  } catch (error) {
    console.error('SendGrid email error:', error.toString());
    console.error('Error details:', error.response ? JSON.stringify(error.response.body) : 'No response details');
    return { success: false, error };
  }
};
```

### 5. Add Test Endpoint for Production Debugging

```javascript
// server/api/email/index.js - add a test endpoint
router.get('/test-connection', async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Email API endpoint is working',
      environment: process.env.NODE_ENV,
      sendgridApiKey: !!process.env.SENDGRID_API_KEY,
      frontendUrl: process.env.FRONTEND_URL
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Testing After Deployment

After implementing these fixes and deploying to production:

1. Visit https://benchlot.com/api/email/test-connection to verify API connectivity
2. Create a test tool listing to trigger a real email
3. Check server logs in Vercel for any SendGrid errors

## Additional Troubleshooting

If emails still aren't working after implementing these fixes:

1. **SendGrid Status:** Check if SendGrid is experiencing any service disruptions
2. **API Key Rotation:** Generate a new SendGrid API key and update environment variables
3. **Email Templates:** Verify that the template IDs are correct and templates exist in SendGrid
4. **Domain Authentication:** Ensure your domain is properly authenticated in SendGrid