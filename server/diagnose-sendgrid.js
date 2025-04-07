// API Route diagnostics for SendGrid integration
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const emailService = require('./utils/emailService');

const app = express();
const PORT = process.env.DIAGNOSE_PORT || 3999;

// Parse JSON bodies and enable CORS
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Benchlot SendGrid Diagnostics Tool',
    message: 'Use the following endpoints to diagnose SendGrid issues:',
    endpoints: [
      '/env - Check environment variables',
      '/templates - Check template IDs',
      '/send-test - Send a test email',
      '/send-template - Send a test template email'
    ]
  });
});

// Environment check endpoint
app.get('/env', (req, res) => {
  const sendgridKey = process.env.SENDGRID_API_KEY || '';
  const maskedKey = sendgridKey 
    ? `${sendgridKey.substring(0, 5)}...${sendgridKey.length > 10 ? sendgridKey.substring(sendgridKey.length - 5) : ''} (${sendgridKey.length} chars)` 
    : 'Not set';
    
  res.json({
    environment: process.env.NODE_ENV,
    sendgridApiKey: maskedKey,
    frontendUrl: process.env.FRONTEND_URL,
    port: process.env.PORT,
    timestamp: new Date().toISOString()
  });
});

// Template check endpoint
app.get('/templates', (req, res) => {
  try {
    const templateIds = emailService.TEMPLATE_IDS || {};
    
    res.json({
      templateIds,
      availableTemplates: Object.keys(templateIds).length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve template IDs',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Send test email endpoint
app.post('/send-test', async (req, res) => {
  try {
    const { to = 'robertlawless@protonmail.com' } = req.body;
    
    console.log(`Attempting to send test email to ${to}...`);
    
    // Create simple test email
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const result = await sgMail.send({
      to,
      from: 'notifications@benchlot.com',
      subject: 'Benchlot API Diagnostic Test',
      text: 'This is a test email from the Benchlot diagnostic tool',
      html: `<h1>Benchlot API Diagnostic Test</h1>
             <p>This email was sent at ${new Date().toLocaleString()}</p>
             <p>If you're receiving this, the basic SendGrid integration is working!</p>`
    });
    
    res.json({
      success: true,
      message: `Test email sent to ${to}`,
      statusCode: result[0].statusCode,
      headers: result[0].headers
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      message: error.message,
      response: error.response ? {
        statusCode: error.response.statusCode,
        body: error.response.body
      } : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Send test template email endpoint
app.post('/send-template', async (req, res) => {
  try {
    const { 
      to = 'robertlawless@protonmail.com',
      template = 'listing-published' 
    } = req.body;
    
    console.log(`Attempting to send ${template} template email to ${to}...`);
    
    let result;
    
    switch (template) {
      case 'listing-published':
        result = await emailService.sendListingPublishedEmail(to, {
          title: 'DeWalt Power Drill (API Test)',
          price: 129.99,
          image: 'https://benchlot.com/images/placeholder-tool.jpg',
          id: '12345-api-test-id'
        });
        break;
      
      case 'account-creation':
        result = await emailService.sendAccountCreationEmail(to, 'API Test User');
        break;
        
      case 'test':
        result = await emailService.sendTestEmail(to);
        break;
        
      default:
        throw new Error(`Unknown template type: ${template}`);
    }
    
    res.json({
      success: result.success,
      message: `Template email (${template}) sent to ${to}`,
      result
    });
  } catch (error) {
    console.error(`Error sending ${req.body.template} template email:`, error);
    
    res.status(500).json({
      success: false,
      error: `Failed to send ${req.body.template} template email`,
      message: error.message,
      response: error.response ? {
        statusCode: error.response.statusCode,
        body: error.response.body
      } : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`SendGrid diagnostic server running at http://localhost:${PORT}`);
  console.log(`Try these endpoints:
  - GET  http://localhost:${PORT}/env
  - GET  http://localhost:${PORT}/templates
  - POST http://localhost:${PORT}/send-test (with JSON body: {"to":"your-email@example.com"})
  - POST http://localhost:${PORT}/send-template (with JSON body: {"to":"your-email@example.com","template":"listing-published"})
  `);
});