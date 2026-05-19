import mongoose from 'mongoose';

const TEST_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberhex_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 10000 });
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
