// Production API diagnostic tool
// This script simulates client-side API calls to check production endpoints
require('dotenv').config();
const fetch = require('node-fetch');
const https = require('https');

// Configure these based on your production environment
const PRODUCTION_URL = 'https://benchlot.com'; // Change to your production URL
const API_ENDPOINTS = [
  '/api/email/test-connection',
  '/api/email/listing-published',
  '/api/email/test',
  '/api/health'
];

// Custom agent with longer timeout
const agent = new https.Agent({
  timeout: 30000, // 30 seconds
  keepAlive: true
});

// Test HTTP methods against an endpoint
async function testEndpoint(url, method = 'GET', data = null) {
  console.log(`\n${method} ${url}`);
  console.log('---------------------------------------');
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'BenchlotAPITester/1.0'
      },
      agent,
      timeout: 30000
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    // Make the request
    const response = await fetch(url, options);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    // Log headers
    console.log('Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Try to get response as text
    let responseText = '';
    try {
      responseText = await response.text();
    } catch (error) {
      console.error(`Error getting response text: ${error.message}`);
    }
    
    // Try to parse as JSON
    let responseJson = null;
    try {
      responseJson = JSON.parse(responseText);
      console.log('Response Body (JSON):');
      console.log(JSON.stringify(responseJson, null, 2));
    } catch (error) {
      console.log('Response Body (Text):');
      console.log(responseText.substring(0, 1000)); // Limiting output
      
      if (responseText.length > 1000) {
        console.log(`... (${responseText.length - 1000} more characters)`);
      }
    }
    
    return { 
      success: response.ok,
      status: response.status,
      body: responseJson || responseText
    };
  } catch (error) {
    console.error(`Network error: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Test all endpoints
async function testAllEndpoints() {
  console.log(`Testing API endpoints on ${PRODUCTION_URL}`);
  console.log('===========================================');
  
  for (const endpoint of API_ENDPOINTS) {
    const url = `${PRODUCTION_URL}${endpoint}`;
    
    // Test GET on all endpoints
    await testEndpoint(url, 'GET');
    
    // For non-test-connection endpoints, test OPTIONS
    if (!endpoint.includes('test-connection')) {
      await testEndpoint(url, 'OPTIONS');
    }
    
    // For email endpoints, test POST with sample data
    if (endpoint.includes('/api/email/')) {
      // Prepare test data based on endpoint
      let testData;
      
      if (endpoint.includes('listing-published')) {
        testData = {
          email: 'test@example.com',
          listingDetails: {
            title: 'Test Tool Listing',
            price: 99.99,
            image: 'https://benchlot.com/images/placeholder-tool.jpg',
            id: 'test-id-12345'
          }
        };
      } else if (endpoint.includes('test')) {
        testData = {
          email: 'test@example.com'
        };
      }
      
      if (testData) {
        await testEndpoint(url, 'POST', testData);
      }
    }
  }
  
  console.log('\nAPI diagnostics complete!');
}

// Run the tests
testAllEndpoints().catch(error => {
  console.error('Fatal error during testing:', error);
});