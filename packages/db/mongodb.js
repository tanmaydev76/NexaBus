import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// readyState can report 1 ("connected") even when the pooled sockets behind
// it are actually dead (e.g. silently dropped by a NAT/firewall in between
// heartbeats) — queries against such a connection hang and buffer-time-out
// instead of failing fast. A short ping is the only reliable way to tell.
async function isHealthy(conn) {
  try {
    await conn.connection.db.admin().command({ ping: 1 }, { maxTimeMS: 3000 });
    return true;
  } catch {
    return false;
  }
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env.local');
  }

  if (cached.conn) {
    if (mongoose.connection.readyState === 1 && (await isHealthy(cached.conn))) {
      return cached.conn;
    }
    cached.conn = null;
    cached.promise = null;
    try { await mongoose.disconnect(); } catch { /* already dead, nothing to clean up */ }
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      heartbeatFrequencyMS: 5000,
      maxPoolSize: 5,
    }).catch((err) => {
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
