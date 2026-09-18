import { jest, beforeAll, afterAll, afterEach } from '@jest/globals';
import mongoose from 'mongoose';

jest.setTimeout(30000);

beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/sundae_test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.COOKIE_SECRET = 'test-cookie-secret';
  process.env.ALLOW_REGISTRATION = 'true';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
