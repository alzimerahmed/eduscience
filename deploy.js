/**
 * Deployment helper script
 * 
 * This script helps with deploying the application to Netlify
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.error('Error: .env file not found. Please create it with your Supabase credentials.');
  process.exit(1);
}

// Read environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1];
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase credentials not found in .env file.');
  process.exit(1);
}

console.log('✓ Supabase credentials found');

// Build the application
console.log('Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✓ Build completed successfully');
} catch (error) {
  console.error('Error during build:', error);
  process.exit(1);
}

// Prepare for Netlify deployment
console.log('Preparing for deployment...');

// Check if netlify.toml exists
if (!fs.existsSync('netlify.toml')) {
  console.error('Error: netlify.toml file not found.');
  process.exit(1);
}

console.log('✓ Netlify configuration found');

// Create netlify directory if it doesn't exist
if (!fs.existsSync('netlify/functions')) {
  fs.mkdirSync('netlify/functions', { recursive: true });
}

// Create a simple Netlify function for health check
const healthCheckFunction = `
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "SciencePapers API is running",
      timestamp: new Date().toISOString()
    })
  };
};
`;

fs.writeFileSync('netlify/functions/health.js', healthCheckFunction);
console.log('✓ Created health check function');

// Instructions for manual deployment
console.log('\n===== DEPLOYMENT INSTRUCTIONS =====');
console.log('1. Login to Netlify CLI (if not already logged in):');
console.log('   npx netlify login');
console.log('\n2. Initialize and deploy with Netlify:');
console.log('   npx netlify deploy');
console.log('\n3. Follow the prompts and choose:');
console.log('   - Create & configure a new site');
console.log('   - Select your team');
console.log('   - Enter a site name (or leave blank for a random name)');
console.log('   - For the publish directory, enter: dist');
console.log('\n4. After deployment, set up environment variables:');
console.log('   - Go to your Netlify site settings');
console.log('   - Navigate to "Site settings" > "Environment variables"');
console.log('   - Add the following environment variables:');
console.log(`     VITE_SUPABASE_URL: ${supabaseUrl}`);
console.log(`     VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey}`);
console.log('\n5. Trigger a new deployment or redeploy');
console.log('\nNote: For production deployment, use:');
console.log('   npx netlify deploy --prod');
console.log('\n===================================');