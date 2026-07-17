import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethio-parents-portal';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  mongod: unknown | null;
  seeded: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null, mongod: null, seeded: false };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    let uri = MONGODB_URI;

    // Try connecting to real MongoDB first, fall back to in-memory
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    } catch {
      console.log('MongoDB not found locally. Starting in-memory MongoDB...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { port: 27017 },
      });
      uri = mongod.getUri();
      cached.mongod = mongod;
      console.log(`In-memory MongoDB started at ${uri}`);
    }

    cached.promise = mongoose.connect(uri, {
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
