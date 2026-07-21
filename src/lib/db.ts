import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null, seeded: false };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set. Please configure it in your Vercel project settings.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  // Auto-seed if database is empty (only once per server lifetime)
  if (!cached.seeded) {
    cached.seeded = true;
    try {
      const User = (await import('./models/User')).default;
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('Database is empty. Running seed...');
        const { seedData } = await import('./seed-helpers');
        await seedData();
        console.log('Seed complete!');
      }
    } catch (err) {
      console.error('Auto-seed error:', err);
    }
  }

  return cached.conn;
}
