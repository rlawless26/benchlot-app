// Vercel API endpoint that connects to our Express server
const { createServer } = require('http')
const { parse } = require('url')
const express = require('express')
const cors = require('cors')
const app = express()

// Import our actual server
const serverApp = require('../server/index')

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}))

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Benchlot API is running via Vercel Functions',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// Use our Express server
app.use(serverApp)

// Export for Vercel serverless functions
module.exports = (req, res) => {
  // Log incoming requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.url}`)
  }
  
  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
    res.setHeader('Access-Control-Max-Age', '86400')
    res.end()
    return
  }
  
  // Process the request through our Express app
  return app(req, res)
}