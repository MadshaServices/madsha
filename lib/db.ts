// lib/db.ts
import mongoose from 'mongoose';

// ✅ Fix: Use MONGODB_URI (match with .env.local)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

// Global cache for connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('✅ Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    // ✅ Better options with timeouts
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds
      family: 4, // Force IPv4 (sometimes helps with DNS issues)
      retryWrites: true,
      retryReads: true,
    };

    console.log('🔄 Creating new database connection...');
    console.log('📡 Connecting to:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Hide password in logs
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ Database connected successfully');
        
        // ✅ Log connection info (safe)
        const connection = mongoose.connection;
        console.log('📊 Database:', connection.name);
        console.log('📊 Host:', connection.host);
        
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ Database connection failed:');
        
        // ✅ Detailed error messages
        if (error.name === 'MongoServerSelectionError') {
          console.error('⚠️ Cannot reach MongoDB server. Check:');
          console.error('   1. Network connection');
          console.error('   2. MongoDB Atlas IP whitelist');
          console.error('   3. Connection string is correct');
        } else if (error.code === 'ENOTFOUND') {
          console.error('⚠️ DNS lookup failed. Hostname not found.');
          console.error('   Check if cluster name is correct in connection string');
        } else if (error.code === 18) {
          console.error('⚠️ Authentication failed. Check username/password');
        } else {
          console.error('⚠️', error.message);
        }
        
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to establish database connection');
    throw e;
  }

  return cached.conn;
}

// ✅ Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export default dbConnect;