import httpStatus from 'http-status';
import { SaveOptions, Types } from 'mongoose';
import { IGame, Game } from '@/models';
import { Logger } from '@/config/logger';
import { IXgContext } from '@/types/global';
import { ApiKeyService } from './apiKey.service';
import { API_KEY_STATUS } from '@/models/apiKey.model';
import { checkDocExists, trackEntityEvent, EVENT_ACTIONS } from '@/utils/helpers';

export type CreateGameDto = Partial<IGame>;
/**
 * Create a Game
 * @param {Game} gameBody
 * @returns {Promise<IGame>}
 */
const createGame = (gameBody: CreateGameDto, xgContext: IXgContext, options: SaveOptions) => {
  trackEntityEvent(gameBody, 'GAME', EVENT_ACTIONS.CREATE, xgContext, { title: gameBody.title });

  return Game.create([gameBody], options);
};

/**
 * Query for games
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - aSort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryGames = (filter: Record<string, any>, options: Record<string, any>) => Game.paginate(filter, options);

/**
 * Get game by api key
 * @param {String} apiKey
 * @returns {Promise<IGame>}
 */
const getByApiKey = async (apiKey: string) => {
  const apiKeyModel = await ApiKeyService.getApiKeyByValue(apiKey);

  if (!apiKeyModel || apiKeyModel.status === API_KEY_STATUS.INACTIVE) {
    return null;
  }

  return getGameById(apiKeyModel.gameId.toString());
};

/**
 * Get games by id
 * @param {ObjectId} id
 * @returns {Promise<IGame>}
 */
const getGameById = (id: string) => Game.findById(id);

/**
 * Get games by id
 * @param {ObjectId} gameId
 * @returns {Promise<IGame>}
 */
const getGameByGameId = (gameId: string) => Game.findOne({ shortGameId: gameId });

/**
 * Update game by id
 * @param {ObjectId} gameId
 * @param {Object} updateBody
 * @returns {Promise<IGame>}
 */
const updateGameById = async (gameId: string, xgContext: IXgContext, updateBody: Partial<IGame>) => {
  let game = await getGameById(gameId);

  Object.assign(game, updateBody);

  await game.save();
  Logger.info(`Game ${game._id} was updated succesdully`);
  return game;
};

/**
 * Delete game by id
 * @param {ObjectId} gameId
 * @returns {Promise<IGame>}
 */
const deleteGameById = async (gameId: string, xgContext: IXgContext) => {
  let game = await getGameById(gameId);

  checkDocExists(game, `Game with id - ${gameId} not found`);

  trackEntityEvent(game, 'GAME', EVENT_ACTIONS.DELETE, xgContext, {
    gameId,
  });

  Logger.info('Remove game', game);
  await game.save();
  await game.remove();
  return game;
};

const createTransaction = <T = unknown>(cb: (tx) => T) => Game.transaction(cb);

export const GameService = {
  createGame,
  queryGames,
  getByApiKey,
  getGameById,
  getGameByGameId,
  updateGameById,
  deleteGameById,
  createTransaction,
};
