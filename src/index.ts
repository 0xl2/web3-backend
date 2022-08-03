import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { app } from './app';
import { Config } from './config/config';
import { Logger } from './config/logger';
import { FireblocksConnector } from './connectors';
import { MongoConnector } from './connectors/mongoConnector';
import { paymentManager } from './services/payment.service';
import { walletManager } from './services';
import { Web3Service } from './services/web3';

let server: any;
const defaultClient = Web3Service.getWeb3Client('default');

(() => {
  try {
    // it only works when we deploy to server
    // await mongoose.connect(config.mongoose.url, config.mongoose.options);
    // logger.info('Connected to MongoDB');
    server = app.listen(Config.port, () => {
      Logger.info(`Starting ${Config.appType} app, in env: ${Config.env}, listening to port ${Config.port}`);
      MongoConnector.start();
      walletManager.start();
      defaultClient.start();
      FireblocksConnector.start();
      paymentManager.start();
    });
  } catch (err) {
    Logger.error('Server crashed', err);
  }
})();

const unexpectedErrorHandler = (error: any) => {
  Logger.error('UNHANDLED ERROR');
  Logger.error(error);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  Logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
