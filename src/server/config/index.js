require('dotenv').config();

const config = {
  env: process.env.ENV,
  port: process.env.PORT,
  apiUrl: process.env.API_URL,
  apiKeyToken: process.env.API_KEY_TOKEN,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

module.exports = { config };
