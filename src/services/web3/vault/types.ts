export interface CreateWalletWeb3 {
  account: string;
  refId: string;
  chainName: string;
}

export interface IVaultManager {
  createWallet: (options: CreateWalletWeb3) => Promise<string>;
}
