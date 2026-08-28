import mongoose from 'mongoose';
import { config } from './environment.js';
import { Favorite } from '../models/Favorite.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    
    // Sync indexes to clean any outdated unique indexes (such as legacy customer_1 on favorites)
    try {
      await Favorite.syncIndexes();
    } catch (e) {
      console.warn('[MongoDB] Index sync note:', e.message);
    }

    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};
