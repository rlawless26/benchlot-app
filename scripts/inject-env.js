// Inject environment variables into the production HTML
const fs = require('fs');
const path = require('path');

console.log('Injecting environment variables into built HTML...');

// Define the environment variables to replace
const ENV_VARS = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY',
  'REACT_APP_STRIPE_PUBLISHABLE_KEY',
  'REACT_APP_API_URL',
  'REACT_APP_FRONTEND_URL'
];

// Path to the built index.html
const indexPath = path.join(__dirname, '../build/index.html');

// Make sure the build directory exists
if (!fs.existsSync(path.join(__dirname, '../build'))) {
  console.error('Build directory not found. Make sure you run this script after building the app.');
  process.exit(1);
}

// Read the built index.html
let html;
try {
  html = fs.readFileSync(indexPath, 'utf8');
  console.log('Successfully read index.html');
} catch (err) {
  console.error('Error reading index.html:', err);
  process.exit(1);
}

// Replace environment variables
ENV_VARS.forEach(varName => {
  const placeholder = `%${varName}%`;
  const value = process.env[varName] || '';
  
  if (value) {
    console.log(`Replacing ${placeholder} with value (length: ${value.length})`);
    html = html.replace(placeholder, value);
  } else {
    console.warn(`Warning: Environment variable ${varName} not found`);
    html = html.replace(placeholder, '');
  }
});

// Write the modified HTML back to the file
try {
  fs.writeFileSync(indexPath, html);
  console.log('Successfully wrote modified index.html');
} catch (err) {
  console.error('Error writing index.html:', err);
  process.exit(1);
}

console.log('Environment variable injection complete!');