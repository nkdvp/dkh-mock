import mongoose from 'mongoose';
import Logger from './logger';

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

export default function connect() {
  const logger = Logger.create('mongodb');
  const db = mongoose.connection;
  db.on('connecting', () => {
    logger.info('connecting to MongoDB...');
  });

  db.on('error', (error: any) => {
    logger.error(`Error in MongoDb connection: ${error.message}`);
    mongoose.disconnect();
  });
  db.on('connected', () => {
    logger.info('MongoDB connected!');
  });
  db.once('open', () => {
    logger.info('MongoDB connection opened!');
  });
  db.on('reconnected', () => {
    logger.info('MongoDB reconnected!');
  });
  db.on('disconnected', async () => {
    logger.info('MongoDB disconnected!');
    await wait(2000);
    try {
      await mongoose.connect(process.env.MONGO_URI, {
      });
    } catch (e) {
      logger.error(e.message);
    }
  });

  mongoose.connect(process.env.MONGO_URI, {
  });
}
