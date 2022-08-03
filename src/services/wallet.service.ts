import { Logger } from '@/config/logger';
import { Wallet, IWallet } from '@/models/wallet.model';

class WalletManager {
  private wallets: Map<string, IWallet>;

  public async start() {
    Logger.info('Starting Wallets Manager. Initializing...');
    this.wallets = new Map();

    const dbWallets = await Wallet.find({});

    dbWallets.forEach((wallet) => {
      this.wallets.set(wallet.publicKey, wallet);
    });

    Logger.info('Started Wallets Manager');
  }

  public getWalletByAddress = (address: string) => {
    return this.wallets?.get(address);
  };
}

export const walletManager = new WalletManager();
