import { Logger } from '@/config/logger';
import { IMintedNFT, MintedNFTS } from '@/models';
import { ApiError } from '@/utils/api';
import httpStatus from 'http-status';

export type CreateMintedNFTDto = Partial<IMintedNFT>;

/**
 * Get all minted nfts
 * @param {ObjectId} id
 * @returns {Promise<IMintedNFT>}
 */
const getMintedNFTById = (id: string) => MintedNFTS.findById(id);

/**
 * Get all minted nfts
 * @param {Object} query
 * @returns {Promise<[IMintedNFT]>}
 */
const getAllMintedNFTS = (query, options) => MintedNFTS.paginate(query, options);

/**
 * Get latest minted nft
 * @param {Object} query
 * @returns {Promise<[IMintedNFT]>}
 */
const getLatestMintedNFT = (query, options) => MintedNFTS.find(query).sort(options).limit(1);

/**
 * Query for players
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - aSort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getMintedNFTSQuery = (filter: any, options: any) => MintedNFTS.paginate(filter, options);

/**
 * Create a Minted NFT
 * @param {IMintedNFT} mintedNFTBody
 * @returns {Promise<IMintedNFT>}
 */
const createMintedNFT = async (mintedNFTBody: CreateMintedNFTDto) => MintedNFTS.create(mintedNFTBody);

const updateMintedNftById = async (mintedNftId: string, updateBody: Partial<IMintedNFT>) => {
  Logger.info(`Updating minted nft: ${mintedNftId} and params: ${updateBody}`)
  const nft = await getMintedNFTById(mintedNftId);
  if (!nft) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Minted NFT not found');
  }

  Object.assign(nft, updateBody);
  await nft.save();
  Logger.info(`Update MintedNFT by tx hash ${nft.transactionHash}`);
  return nft;
};

export const MintedNFTSService = {
  getMintedNFTById,
  getAllMintedNFTS,
  getLatestMintedNFT,
  getMintedNFTSQuery,
  createMintedNFT,
  updateMintedNftById,
};
