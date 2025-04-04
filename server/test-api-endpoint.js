require('dotenv').config();
const axios = require('axios');

// Configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://benchlot.com/api/email' 
  : 'http://localhost:3001/api/email';

async function testListingPublishedEndpoint() {
  try {
    console.log(`Testing endpoint: ${API_URL}/listing-published`);
    
    const payload = {
      email: 'test@example.com', // Change to your email for testing
      listingDetails: {
        title: 'Test Tool Listing via API',
        price: 99.99,
        image: 'https://benchlot.com/images/placeholder-tool.jpg',
        id: '123456'
      }
    };
    
    console.log('Sending request with payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(`${API_URL}/listing-published`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error calling API endpoint:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Request error (no response received):', error.message);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return null;
  }
}

// Run the test
testListingPublishedEndpoint();