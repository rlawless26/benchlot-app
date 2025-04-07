/**
 * Test URL Accessibility
 * This script tests if a URL is accessible by making a HEAD request
 */

const https = require('https');

// URL to test
const url = 'https://tavhowcenicgowmdmbcz.supabase.co/storage/v1/object/public/tool-images/tools/505d06df-bb29-406a-9864-ac0e56e16a02/505d06df-bb29-406a-9864-ac0e56e16a02_0.jpeg';

console.log(`Testing URL: ${url}`);

// Make a HEAD request
const req = https.request(url, { method: 'HEAD' }, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  if (res.statusCode >= 200 && res.statusCode < 300) {
    console.log('URL is accessible');
  } else {
    console.log('URL is NOT accessible');
  }
});

req.on('error', (error) => {
  console.error('Error testing URL:', error);
});

req.end();