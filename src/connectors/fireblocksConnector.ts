import fs from 'fs';
import path from 'path';
import { Config } from '@/config/config';
import { FireblocksSDK } from 'fireblocks-sdk';
import { Logger } from '@/config/logger';

let fireblocks: FireblocksSDK = null;

const FIREBLOCKS_TIMEOUT_MS = 5000;

const start = () => {
  fs.readFile(path.resolve(__dirname, '../../fireblocks_secret.key'), (err, data) => {
    if (err) {
      throw new Error(err.message);
    }

    const apiSecret = data.toString();

    Logger.info('Connecting to Fireblocks');
    fireblocks = new FireblocksSDK(apiSecret, Config.fireblocks.apiKey, undefined, undefined, {
      timeoutInMs: FIREBLOCKS_TIMEOUT_MS,
    });
    Logger.info('Connected to Fireblocks');
  });
};

const FireblocksInstance = () => {
  Logger.info(`Return fireblocks ${fireblocks}`);
  return fireblocks;
};

export const FireblocksConnector = {
  start,
  FireblocksInstance,
};
