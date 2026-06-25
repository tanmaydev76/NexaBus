import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env.local');
  }

  // readyState 1 = connected. A stale/dropped connection is still a truthy
  // object, so without this check a dead connection would be cached forever
  // and every query against it would hang until it buffer-times-out.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.conn = null;
    cached.promise = mongoose.connect(MONGODB_URI).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

export default connectDB;
