import { Logger } from '@/config/logger';
import { ImmutableXClient } from '@/services/web3/immutableX';
import OpenSeaMarketPlace from '@/services/web3/marketplace/opensea';
import ImmutableXMarketPlace from '@/services/web3/marketplace/immutableX';
import { DefaultClient } from '@/services/web3/default';
import { web3Clients, Web3Service } from '@/services/web3';
import { ContractService } from '@/services/contract.service';

export interface IWeb3Info {
  contract: any;
  chainInfo: any;
  web3Client: DefaultClient | ImmutableXClient;
  web3Market: OpenSeaMarketPlace | ImmutableXMarketPlace;
}

export const getWeb3Info = async ({ contractId, chainName }): Promise<IWeb3Info> => {
  Logger.info(`Get web3 info for contractId - ${contractId} chain - ${chainName}`);
  const contract = await ContractService.getContractById(contractId);
  const chainInfo = Web3Service.getChainInfo(chainName);
  const web3Client = Web3Service.getWeb3Client(chainInfo.client as web3Clients);
  const web3Market = Web3Service.getWeb3MarketPlace(chainInfo.client as web3Clients);

  return {
    contract,
    web3Client,
    web3Market,
    chainInfo,
  };
};
