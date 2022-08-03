//Import the mongoose module
import mongoose from 'mongoose';
const AutoIncrementFactory = require('mongoose-sequence');
import { Logger } from '@/config/logger';

const mongoDB = process.env.MONGODB_URL_API!;

//Get the default connection
const db = mongoose.connection;

const start = () => {
  //Bind connection to error event (to get notification of connection errors)
  db.on('error', (e) => Logger.error('MongoDB connection error:', e));
  if (process.env.NODE_ENV !== 'test') {
    Logger.info('Connecting to MongoDB Instance.');
    return mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then((e) => {
      Logger.info('Connected to MongoDB Instance.');
      return true;
    });
  }

  return Promise.resolve(null);
};

const AutoIncrement = AutoIncrementFactory(db);

export const MongoConnector = {
  start,
  AutoIncrement,
};
