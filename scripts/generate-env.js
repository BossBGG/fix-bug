const fs = require('fs');
const path = require('path');

// Load environment variables from .env if exists
if (fs.existsSync('.env')) {
  try {
    require('dotenv').config({ path: '.env' });
  } catch (error) {
    console.log('dotenv not available, using process.env directly');
  }
}

const envConfig = {};
for (const key in process.env) {
  if (key.startsWith('NEXT_PUBLIC_')) {
    envConfig[key] = process.env[key];
  }
}

const fileContent = `window.__ENV__ = ${JSON.stringify(envConfig, null, 2)};
self.__ENV__ = ${JSON.stringify(envConfig, null, 2)};`;

// Write to public directory (for local/build)
const publicPath = path.join(__dirname, '..', 'public', 'env-config.js');
// Write to mounted volume (for production)
const mountedPath = '/app/runtime-env/env-config.js';

try {
  // Always write to public directory
  fs.writeFileSync(publicPath, fileContent);
  console.log('Success: public/env-config.js has been created.');
  
  // Try to write to mounted volume if it exists (production)
  if (fs.existsSync('/app/runtime-env')) {
    fs.writeFileSync(mountedPath, fileContent);
    console.log('Success: mounted env-config.js has been created.');
  } else if (fs.existsSync('/app/public')) {
    // Fallback to old path if new path doesn't exist (for Vault Agent compatibility)
    fs.writeFileSync('/app/public/env-config.js', fileContent);
    console.log('Success: fallback mounted env-config.js has been created.');
  }



} catch (error) {
  console.error('Error writing env-config.js:', error);
}