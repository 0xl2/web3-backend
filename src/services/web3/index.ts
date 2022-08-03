import { Contract } from 'ethers';
import { Config } from '@/config/config';
import { walletManager } from '@/services';
import { ImmutableXClient } from './immutableX';
import { IContract } from '@/models/contract.model';
import OpenSeaMarketPlace from './marketplace/opensea';
import ImmutableXMarketPlace from './marketplace/immutableX';
import { DefaultClient } from './default';
import fireblocksVaultManager from './vault/fireblocks';
import { IVaultManager } from './vault/types';

export type web3Clients = 'default' | 'immutable';

export const availableNetworks = ['polygon', 'immutable'];

const chainNameToChainMap = {
  polygon: {
    production: {
      id: 137,
      chain: 'matic',
      hex: '0x89',
      name: 'Polygon Mainnet',
      fireblocksName: 'MATIC_POLYGON',
      client: 'default',
      provider: Config.rpcNodes.polygonMainnet,
    },
    '*': {
      id: 80001,
      chain: 'mumbai',
      hex: '0x13881',
      name: 'Mumbai',
      fireblocksName: 'MATIC_POLYGON_MUMBAI',
      client: 'default',
      provider: Config.rpcNodes.polygonMumbai,
    },
  },
  immutable: {
    production: {
      id: 1,
      chain: 'ethereum',
      hex: '0x1',
      name: 'Ethereum Mainnet',
      fireblocksName: 'ETH',
      client: 'immutable',
      provider: Config.rpcNodes.ethereumMainnet,
    },
    '*': {
      id: 3,
      chain: 'ropsten',
      hex: '0x3',
      name: 'Ropsten',
      fireblocksName: 'ETH_TEST',
      client: 'immutable',
      provider: Config.rpcNodes.ethereumRopsten,
    },
  },
};

const contractsMap = {};

const getChainInfo = (chainName: string) => {
  const chain = chainNameToChainMap[chainName][Config.chainInfo.currentNetwork];

  if (!chain) {
    throw new Error(`Chain hex ${chainName} was not found`);
  }

  return chain;
};

const getProvider = (chain: string) => {
  const ethers = Web3Service.getWeb3Client('default').instance();
  const providerUrl = Web3Service.getChainInfo(chain).provider;
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  return { provider, ethers };
};

const getContract = (contract: IContract): Promise<Contract> => {
  if (!contractsMap[contract.chainName]) {
    const { provider, ethers } = getProvider(contract.chainName);
    const wallet = walletManager.getWalletByAddress(contract.owner);
    const signer = new ethers.Wallet(wallet.privateKey, provider);
    const contractEth = new ethers.Contract(contract.address, contract.abi, signer);
    contractsMap[contract.chainName] = contractEth;
  }
  return contractsMap[contract.chainName];
};

const getContractFactory = (contract: IContract) => {
  const chainInfo = getChainInfo(contract.chainName);
  const { provider, ethers } = getProvider(contract.chainName);
  const signer = new ethers.Wallet(chainInfo.deployer, provider);
  const factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer);
  return factory;
};

const getVaultManager = (clientName: web3Clients): IVaultManager => {
  switch (clientName) {
    case 'default':
      return fireblocksVaultManager;
    case 'immutable':
      return fireblocksVaultManager;
    default:
      return null;
  }
};

const executeFunctionByName = (contractEth, options) => {
  let transaction;
  switch (options.functionName) {
    // case 'createGameToken': // XG_Platform_Game
    //   transaction = contractEth.createGameToken(
    //     options.params.cap_,
    //     options.params.isNFT_,
    //     options.params.name_,
    //     options.params.symbol_);
    //   break;
    case 'mintToken': // XG_Polygon_Game_ERC721A
      transaction = contractEth.mintToken(options.params.to_, options.params.gameTokenId_, options.params.amount_);
      break;
    // case 'mintBatchToken': // XG_Platform_Game
    //   transaction = contractEth.mintBatchToken(
    //     options.params.to_,
    //     options.params.gameTokenId_,
    //     options.params.amount_,
    //     options.params.data_);
    //   break;
    case 'burnToken': // XG_Polygon_Game_ERC721A
      transaction = contractEth.burnToken(options.params.id_);
      break;
    case 'burnBatchToken': // XG_Polygon_Game_ERC721A
      transaction = contractEth.burnBatchToken(options.params.ids_);
      break;
    default:
      break;
  }

  return transaction;
};

const executeFunction = (contract: IContract, options) => {
  const contractEth = getContract(contract);
  return executeFunctionByName(contractEth, options);
};

const getWeb3Client = (clientName: web3Clients) => {
  switch (clientName) {
    case 'default':
      return new DefaultClient();
    case 'immutable':
      return new ImmutableXClient();
    default:
      return null;
  }
};

const getWeb3MarketPlace = (clientName: web3Clients) => {
  switch (clientName) {
    case 'default':
      return new OpenSeaMarketPlace();
    case 'immutable':
      return new ImmutableXMarketPlace();
    default:
      return null;
  }
};

const getAllPaginatedResults = async (cb: Function, options: any, cursor?: string) => {
  options.cursor = cursor;

  const response = await cb(options);
  const results = response.result;

  if (response.cursor != '' && response.cursor != null) {
    const nextPage = await getAllPaginatedResults(cb, options, response.cursor);
    results.push(...nextPage);
  }

  return await results;
};

const getWeb3AvailableNetworks = () => availableNetworks;

export const Web3Service = {
  getProvider,
  getChainInfo,
  getWeb3Client,
  getWeb3MarketPlace,
  getContract,
  getContractFactory,
  getAllPaginatedResults,
  getWeb3AvailableNetworks,
  executeFunction,
  getVaultManager,
};
