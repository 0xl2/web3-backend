import mongoose from 'mongoose';
import { Config } from '@/config/config';

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(Config.mongoose.url, Config.mongoose.options);
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

export default setupTestDB;
