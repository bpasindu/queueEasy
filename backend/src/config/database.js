/**
 * QueueEase— Database Connection
 * MongoDB Atlas connection via Mongoose.
 */

const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;