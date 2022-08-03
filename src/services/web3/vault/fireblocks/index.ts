import httpStatus from 'http-status';
import { FireblocksSDK } from 'fireblocks-sdk';
import { ApiError } from '@/utils/api';
import { Logger } from '@/config/logger';
import { FireblocksConnector } from '@/connectors';
import { Web3Service } from '../..';
import { CreateWalletWeb3, IVaultManager } from '../types';

class FireblocksVaultManager implements IVaultManager {
  public createWallet = async (options: CreateWalletWeb3) => {
    Logger.info(`Creating Fireblocks wallet instance, params: ${JSON.stringify(options)}`);
    let updatedVaultAccount = null;

    try {
      const fireblocks: FireblocksSDK = this.getInstance();
      const vaultAccount = await fireblocks.createVaultAccount(options.account, false, options.refId);
      Logger.info(`Vault account created for player: ${options.refId}, address: ${JSON.stringify(vaultAccount)}`);
      const chainInfo = Web3Service.getChainInfo(options.chainName);
      Logger.info(`Creating wallet asset for network: ${chainInfo.chain}`);
      const updatedVaultAccount = await fireblocks.activateVaultAsset(vaultAccount.id, chainInfo.fireblocksName);
      Logger.info(`Wallet with just created player: ${options.refId}, address: ${JSON.stringify(updatedVaultAccount)}`);
    } catch (error) {
      Logger.error(`Fireblocks Create Wallet: ${JSON.stringify(error)}`);
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create a wallet');
    }

    return updatedVaultAccount.address;
  };

  private getInstance = () => FireblocksConnector.FireblocksInstance();
}

export default new FireblocksVaultManager();
