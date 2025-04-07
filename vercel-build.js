// Simple script to help Vercel build the project correctly
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create output directories
console.log('Setting up Vercel build...');
const outputDir = path.join(__dirname, '.vercel', 'output');
const staticDir = path.join(outputDir, 'static');
const functionsDir = path.join(outputDir, 'functions');
const configPath = path.join(outputDir, 'config.json');

// Create directories
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Build React app
console.log('Building React app...');
execSync('npm run build', { stdio: 'inherit' });

// Copy build to static output
console.log('Copying build to Vercel output...');
execSync(`cp -r build/* ${staticDir}/`);

// Create server function
console.log('Creating API function...');
const serverFunctionDir = path.join(functionsDir, 'api');
fs.mkdirSync(serverFunctionDir, { recursive: true });

// Write function configuration
fs.writeFileSync(
  path.join(serverFunctionDir, '.vc-config.json'),
  JSON.stringify({
    runtime: 'nodejs16.x',
    handler: 'server/index.js',
    launcherType: 'Nodejs',
  })
);

// Copy server files
console.log('Copying server files...');
execSync(`cp -r server ${serverFunctionDir}/`);

// Create Vercel config
console.log('Creating Vercel config...');
fs.writeFileSync(
  configPath,
  JSON.stringify({
    version: 3,
    routes: [
      {
        src: '/api/(.*)',
        dest: '/api'
      },
      {
        handle: 'filesystem'
      },
      {
        src: '/(.*)',
        dest: '/index.html'
      }
    ]
  })
);

console.log('Vercel build completed successfully!');