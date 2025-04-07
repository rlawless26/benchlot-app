// Simple health check endpoint for API verification
module.exports = (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  
  // Return health status
  res.status(200).json({
    status: 'ok',
    message: 'Benchlot API is running',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    env: {
      // List environment variables that are safe to show
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not set',
      apiUrl: process.env.REACT_APP_API_URL ? 'Set' : 'Not set',
      frontendUrl: process.env.REACT_APP_FRONTEND_URL ? 'Set' : 'Not set'
    }
  })
}