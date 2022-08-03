import { ethers } from 'ethers';
import Moralis from 'moralis/node';
import { Logger } from '@/config/logger';
import { ContractService } from '@/services';
import { CHAIN_TYPE, Config } from '@/config/config';
import {
  IWeb3Client,
  ContractWeb3,
  BulkBurnTokenWeb3,
  BulkMintWeb3,
  BurnTokenWeb3,
  CreateGameTokenWeb3,
  MintWeb3,
  ITransaction,
} from '../types';
import { web3Clients, Web3Service } from '../index';

const serverUrl = Config.moralis.serverUrl;
const appId = Config.moralis.appId;
const masterKey = Config.moralis.masterKey;
const moralisSecret = Config.moralis.moralisSecret;

export const serializeNft = (nft) => ({
  network: nft?.network || CHAIN_TYPE.POLYGON,
  token_hash: nft?.token_hash,
  token_address: nft?.token_address,
  token_id: nft?.token_id,
  block_number_minted: nft?.block_number_minted,
  owner_of: nft?.owner_of,
  block_number: nft?.block_number,
  amount: nft?.amount,
  contract_type: nft?.contract_type,
  name: nft?.name,
  symbol: nft?.symbol,
  token_uri: nft?.token_uri,
  marketUrl: nft?.marketUrl,
  metadata: JSON.parse(nft?.metadata),
  last_metadata_sync: new Date(nft?.last_metadata_sync).toISOString(),
  last_token_uri_sync: new Date(nft?.last_token_uri_sync).toISOString(),
  is_valid: nft?.is_valid,
  syncing: nft?.syncing,
  frozen: nft?.frozen,
});

export class DefaultClient implements IWeb3Client {
  public async getAssets(gameContract: ContractWeb3, address: string) {
    const { client, chain } = await Web3Service.getChainInfo(gameContract.chainName);
    const web3Market = Web3Service.getWeb3MarketPlace(client as web3Clients);

    const nfts = await Web3Service.getAllPaginatedResults(Moralis.Web3API.account.getNFTsForContract, {
      chain: Web3Service.getChainInfo(CHAIN_TYPE.POLYGON).chain,
      token_address: gameContract.address,
      address,
    });

    const result = nfts?.map((nft) => {
      const tokenIdDecimal = parseInt(nft.token_id).toString();
      const marketUrl = web3Market.getAssetUrl(chain, gameContract.address, tokenIdDecimal);
      return serializeNft({ ...nft, marketUrl });
    });

    return result;
  }

  public async start() {
    Logger.info('Starting Default Client');

    await Moralis.start({ serverUrl, appId, masterKey, moralisSecret });

    const contracts = await ContractService.queryContracts({}, {});

    Logger.info('Started Default Client');
  }

  // public async createGame(params: CreateGameWeb3, contract: ContractWeb3) {
  //   Logger.info(`CreateGame transaction: ${JSON.stringify(params)}`);
  //   const options = {
  //     contractAddress: contract.address,
  //     functionName: 'createGame',
  //     abi: contract.abi,
  //     params,
  //   };

  //   const result = await Web3Service.executeFunction(contract, options);
  //   Logger.info(`CreateGame transaction sent at tx hash: ${result.hash}`);
  //   return this.mapToTransaction(result);
  // }

  public async createGameToken(params: CreateGameTokenWeb3, contract: ContractWeb3) {
    Logger.info(`CreateGameToken transaction: ${JSON.stringify(params)}`);
    const options = {
      contractAddress: contract.address,
      functionName: 'createGameToken',
      abi: contract.abi,
      params,
    };

    const result = await Web3Service.executeFunction(contract, options);
    Logger.info(`CreateGameToken transaction sent at tx hash: ${result.hash}`);
    return this.mapToTransaction(result);
  }

  public async mint(params: MintWeb3, contract: ContractWeb3) {
    Logger.info(`mint transaction: ${JSON.stringify(params)}`);
    const options = {
      contractAddress: contract.address,
      functionName: 'mintToken',
      abi: contract.abi,
      params: {
        to_: params.to_,
        gameTokenId_: params.gameTokenId_,
        amount_: params.amount_,
      },
    };

    const result = await Web3Service.executeFunction(contract, options);
    Logger.info(`mint transaction sent at tx hash: ${result.hash}`);
    return this.mapToTransaction(result);
  }

  public async bulkMint(params: BulkMintWeb3, contract: ContractWeb3) {
    Logger.info(`bulkMint transaction: ${JSON.stringify(params)}`);
    const options = {
      contractAddress: contract.address,
      functionName: 'mintBatchToken',
      abi: contract.abi,
      params: {
        ...params,
        data_: 0,
      },
    };

    const result = await Web3Service.executeFunction(contract, options);
    Logger.info(`bulkMint transaction sent at tx hash: ${result.hash}`);
    return this.mapToTransaction(result);
  }

  public async burnToken(params: BurnTokenWeb3, contract: ContractWeb3) {
    Logger.info(`burnToken transaction: ${JSON.stringify(params)}`);
    const options = {
      contractAddress: contract.address,
      functionName: 'burnToken',
      abi: contract.abi,
      params,
    };

    const result = await Web3Service.executeFunction(contract, options);
    Logger.info(`burnToken transaction sent at tx hash: ${result.hash}`);
    return this.mapToTransaction(result);
  }

  public async bulkBurnToken(params: BulkBurnTokenWeb3, contract: ContractWeb3) {
    Logger.info(`bulkBurnToken transaction: ${JSON.stringify(params)}`);
    const options = {
      contractAddress: contract.address,
      functionName: 'burnBatchToken',
      abi: contract.abi,
      params,
    };

    const result = await Web3Service.executeFunction(contract, options);
    Logger.info(`bulkBurnToken transaction sent at tx hash: ${result.hash}`);
    return this.mapToTransaction(result);
  }

  public instance() {
    return ethers;
  }

  private mapToTransaction(result) {
    return <ITransaction>{
      hash: result.hash,
      to: result.to,
      from: result.from,
      nonce: result.nonce,
      gasLimit: result.gasLimit,
      gasPrice: result.gasPrice,
      data: result.data,
      value: result.value,
      chainId: result.chainId,
    };
  }
}
