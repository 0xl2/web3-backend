import { Contract, CONTRACT_STATUS, CONTRACT_TYPE, IContract } from '@/models/contract.model';
import { IContractMetadata } from './web3/types';
import { Web3Service } from './web3';
import { ethers } from 'ethers';
import { SaveOptions } from 'mongoose';
import { Logger } from '@/config/logger';

export type CreateContractDto = Omit<IContract, '_id'>;

const queryContracts = (filter: Record<string, any>, options: Record<string, any>) => Contract.paginate(filter, options);

const getContractBy = (filter: Record<string, any>) => Contract.findOne(filter);

const getContractById = (id: string) => Contract.findById(id);

const getContractsByChainNames = (chainNames: string[]) => Contract.find().where('chainName').in(chainNames);

const createContract = (contractDto: CreateContractDto, options: SaveOptions) => Contract.create([contractDto], options);

/**
 * Deploy a Game contract
 * @param {IContract} contractDto
 * @param {IContractMetadata} contractMetadata
 * @param {SaveOptions} options
 * @returns {Promise<IContract>}
 */
const deployGameContract = async (contractDto: IContract, contractMetadata: IContractMetadata, options: SaveOptions) => {
  const factory = Web3Service.getContractFactory(contractDto);
  let contract: ethers.Contract;
  if (contractMetadata.imxCore) {
    contract = await factory.deploy(
      contractMetadata.name,
      contractMetadata.symbol,
      contractMetadata.gameId,
      contractMetadata.baseURI,
      contractMetadata.imxCore
    );
  } else {
    contract = await factory.deploy(
      contractMetadata.name,
      contractMetadata.symbol,
      contractMetadata.gameId,
      contractMetadata.baseURI
    );
  }

  await contract.deployed();

  Logger.info('Game contract deployed successfully');

  contractDto.name = `${contractMetadata.name}-${CONTRACT_TYPE.ERC721}-${contractDto.chainName}`;
  contractDto.description = '';
  contractDto.published = new Date();
  contractDto.address = contract.address;
  contractDto.meta = contractMetadata;
  contractDto.status = CONTRACT_STATUS.PUBLISHED;

  return Contract.create([contractDto], options);
};

export const ContractService = {
  queryContracts,
  getContractBy,
  getContractById,
  getContractsByChainNames,
  createContract,
  deployGameContract,
};
