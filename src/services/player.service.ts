import crypto from 'crypto';
import { Types } from 'mongoose';
import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import { Logger } from '@/config/logger';
import { IXgContext } from '@/types/global';
import { Web3Service } from '@/services/web3';
import { stringToObjectId } from '@/utils/mongoose';
import { IPlayer, Player, PLAYER_STATUS } from '@/models';
import { checkDocExists, trackEntityEvent, EVENT_ACTIONS } from '@/utils/helpers';

const createWallet = async ({ client, playerReq, chainName }): Promise<void> => {
  try {
    let address;
    Logger.info(`Create wallet for player by email - ${playerReq.email}`);
    const vaultManager = Web3Service.getVaultManager(client);

    if (playerReq.address) {
      address = playerReq.address;
    } else {
      address = await vaultManager.createWallet({
        account: playerReq.email,
        refId: playerReq.externalPlayerId,
        chainName,
      });
    }

    playerReq.status = PLAYER_STATUS.ACTIVE;
    playerReq.wallets = {
      ...playerReq.wallets,
      [chainName]: {
        address,
        isExternal: !!playerReq.address,
      },
    };
  } catch (error) {
    Logger.error(`Player Create Wallet: ${JSON.stringify(error)}`);
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Something went wrong. Retry later.');
  }
};

const updateWallet = async ({ client, player, chainName, updateBody }): Promise<void> => {
  try {
    let address;
    const vaultManager = Web3Service.getVaultManager(client);

    if (player.address) {
      address = player.address;
    } else {
      address = await vaultManager.createWallet({
        account: player.email,
        refId: player.externalPlayerId,
        chainName,
      });
    }

    updateBody.status = PLAYER_STATUS.ACTIVE;
    updateBody.wallets = {
      [chainName]: {
        address,
        isExternal: true,
      },
    };
  } catch (error) {
    Logger.error(`Player Update Wallet: ${JSON.stringify(error)}`);
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Something went wrong. Retry later.');
  }
};

const getPlayerAddress = async ({ playerAddress, email, externalId, contract, web3Client }) => {
  if (!playerAddress) {
    const playerParam = email || externalId;
    const filter = { [(email && 'email') || (externalId && 'externalPlayerId')]: playerParam };
    const player = await PlayerService.getPlayerQuery(filter);

    if (!player.wallets[contract.chainName]?.address) {
      const walletAddress = await web3Client.createWallet({
        account: player.email,
        refId: player.externalPlayerId,
        chainName: contract.chainName,
      });

      player.activate();
      player.wallets = {
        ...player.wallets,
        [contract.chainName]: {
          address: walletAddress,
          isExternal: true,
        },
      };

      await player.save();
    }

    return player.wallets[contract.chainName]?.address;
  }
  return playerAddress;
};

const createPlayer = async (playerBody: IPlayer, xgContext: IXgContext) => {
  trackEntityEvent(playerBody, 'PLAYER', EVENT_ACTIONS.CREATE, xgContext, {
    ...playerBody,
  });

  Logger.info('Create player with details', playerBody);
  return Player.create(playerBody);
};

const generatePlayerExternalToken = async (player) => {
  const guid = crypto.randomUUID();
  player.externalLoginToken = guid;
  await player.save();
};

/**
 * Query for players
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - aSort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPlayers = (filter: Record<string, any>, options: Record<string, any>) => Player.paginate(filter, options);

/**
 * Get player by id
 * @param {ObjectId} id
 * @returns {Promise<IPlayer>}
 */
const getPlayerById = (id: string) => Player.findById(id);

/**
 * Get player by email
 * @param {string} email
 * @returns {Promise<IPlayer>}
 */
const getPlayerByEmail = (email: string) => Player.findOne({ email });

/**
 * Get player by email
 * @param {object} filter
 * @returns {Promise<IPlayer>}
 */
const getPlayerQuery = (filter: Record<string, any>) => Player.findOne(filter);

/**
 * Get player by external id
 * @param {string} externalId
 * @returns {Promise<IPlayer>}
 */
const getPlayerByExternalId = (gameId: string, externalId: string) =>
  Player.findOne({ gameId, externalPlayerId: externalId });

/**
 * Get player by guid
 * @param {string} guid
 * @returns {Promise<IPlayer>}
 */
const getPlayerByGuid = (externalLoginToken: string) => Player.findOne({ externalLoginToken });

/**
 * Get player by address
 * @param {string} address
 * @param {string} chainName
 * @returns {Promise<IPlayer>}
 */
const getPlayerByAddress = (address: string, chainName: string) =>
  Player.findOne({
    [`wallets.${chainName}.address`]: address,
  });

/**
 * Update player by id
 * @param {ObjectId} playerId
 * @param {Object} updateBody
 * @returns {Promise<IPlayer>}
 */
const updatePlayerById = async (playerId: string, updateBody: Partial<IPlayer>, xgContext: IXgContext) => {
  Logger.info(`Get player by playerId - ${playerId}`);
  let player = await getPlayerById(playerId);

  checkDocExists(player, `Player by id - ${playerId} not found`);

  if (updateBody.email && (await Player.isEmailTaken(updateBody.email, updateBody.gameId, stringToObjectId(playerId)))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  delete updateBody.events;

  trackEntityEvent(player, 'PLAYER', EVENT_ACTIONS.UPDATE, xgContext, updateBody);

  await player.save();
  return player;
};

const invalidatePlayerExternalToken = async (player) => {
  player.externalLoginToken = null;
  await player.save();
};

/**
 * Delete player by id
 * @param {ObjectId} playerId
 * @returns {Promise<IPlayer>}
 */
const deletePlayerById = async (playerId: string, xgContext: IXgContext) => {
  let player = await getPlayerById(playerId);

  checkDocExists(player, `Player by id - ${playerId} not found`);

  trackEntityEvent(player, 'PLAYER', EVENT_ACTIONS.DELETE, xgContext, {
    playerId,
  });

  await player.save();
  await player.remove();
  return player;
};

export const PlayerService = {
  createWallet,
  updateWallet,
  getPlayerAddress,
  createPlayer,
  generatePlayerExternalToken,
  queryPlayers,
  getPlayerById,
  getPlayerByEmail,
  getPlayerQuery,
  getPlayerByGuid,
  getPlayerByExternalId,
  getPlayerByAddress,
  updatePlayerById,
  invalidatePlayerExternalToken,
  deletePlayerById,
};
