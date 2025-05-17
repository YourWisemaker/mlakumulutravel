const serverless = require('serverless-http');
const { expressApp } = require('../../dist/src/main.netlify');

// Cache the serverless handler for better performance with cold starts
let cachedHandler;

async function setup() {
  if (!cachedHandler) {
    // Create the serverless handler from our Express app
    cachedHandler = serverless(expressApp);
  }
  return cachedHandler;
}

// Export the handler for Netlify Functions
exports.handler = async (event, context) => {
  // Get the handler (reusing if it exists)
  const handler = await setup();
  
  // Process the request
  return handler(event, context);
};
