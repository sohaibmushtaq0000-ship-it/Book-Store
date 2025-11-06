require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book_ecommerce',
  SESSION_SECRET: process.env.SESSION_SECRET || 'your_session_secret_key_change_in_production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || '1234' // Changed to string for consistency
};