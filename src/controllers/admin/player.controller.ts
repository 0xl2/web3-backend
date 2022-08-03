import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { checkDocExists } from '@/utils/helpers';
import { playersResponse } from '@/utils/playersHelper';
import { IPlayer, Player, PLAYER_STATUS } from '@/models';
import { serializeMintedNft } from './mintedNft.controller';
import { PlayerService, InventoryService } from '@/services';
import { ApiError, wrapRequestAsync, xgResponse } from '@/utils/api';

export const serializePlayer = (player) => ({
  id: player.id,
  name: player.name,
  email: player.email,
  gameId: player.gameId,
  status: player.status,
  wallets: player.wallets,
  isEmailVerified: player.isEmailVerified,
  externalPlayerId: player.externalPlayerId,
});

// GET
const getPlayer = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const player = await PlayerService.getPlayerById(id);

  checkDocExists(player, ` Player with Id ${id} not found`);

  req.logger?.info('Player was Taken successfully', player);
  xgResponse(res, serializePlayer(player), httpStatus.OK);
});

const getAllPlayers = wrapRequestAsync(async (req: Request, res: Response) => {
  const { options } = req;

  req.logger?.info('Get players by sorting and pagination', options);
  const players = await PlayerService.queryPlayers({}, options);

  req.logger?.info('Players were Taken successfully', players.results.map(serializePlayer));
  playersResponse({ players, res });
});

const getGamePlayers = wrapRequestAsync(async (req: Request, res: Response) => {
  const { options, user } = req;

  req.logger?.info(`Fetching players for gameId: ${user.gameId}`);
  const players = await PlayerService.queryPlayers({ gameId: user.gameId }, options);

  req.logger?.info('Players were Taken successfully', players.results.map(serializePlayer));
  playersResponse({ res, players });
});

const getInventory = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { options, game } = req;

  req.logger?.info(`Get player by id - ${id}`);
  const player = await PlayerService.getPlayerById(id);

  checkDocExists(player, ` Player with Id ${id} not found`);

  req.logger?.info(`Get nfts for player - ${player!.name}`);
  const nfts = await InventoryService.getInventoryForLocal(player, game.shortGameId, options);

  req.logger?.info('Inventory was Taken successfully', nfts);
  xgResponse(
    res,
    {
      results: nfts.results.map(serializeMintedNft),
    },
    httpStatus.OK,
    {
      pagination: {
        page: nfts.page,
        limit: nfts.limit,
        totalPages: nfts.totalPages,
        totalResults: nfts.totalResults,
      },
    }
  );
});

// POST
const createPlayer = wrapRequestAsync(async (req: Request, res: Response) => {
  const { xgContext } = req;
  const playerReq = req.body;
  const chainName = 'polygon';

  req.logger?.info(`Create player with details: ${playerReq}`);
  playerReq.gameId = req.game['_id'];

  if (await Player.isEmailTaken(playerReq.email, playerReq.gameId.toString())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken.');
  }

  playerReq.status = PLAYER_STATUS.INIT;
  playerReq.wallets = {
    [chainName]: {
      address: null,
    },
  };

  await PlayerService.createWallet({ client: 'default', playerReq, chainName });

  const playerCreated = await PlayerService.createPlayer(playerReq, xgContext);
  req.logger?.info(`Player was created successfully: ${serializePlayer(playerCreated)}`);
  xgResponse(res, serializePlayer(playerCreated), httpStatus.CREATED);
});

const activatePlayer = wrapRequestAsync(async (req: Request, res: Response) => {
  const { xgContext } = req;
  const { id } = req.params;
  const { chainName } = req.body;

  req.logger?.info(`Get player with id: ${id}`);
  const player = await PlayerService.getPlayerById(id);

  checkDocExists(player, `Player with Id ${id} not found`);

  if (player.status === PLAYER_STATUS.ACTIVE) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Player is active.');
  }

  const updateBody: Partial<IPlayer> = {};

  await PlayerService.updateWallet({ client: 'default', player, chainName, updateBody });
  await PlayerService.updatePlayerById(id, updateBody, xgContext);

  req.logger?.info('Player was updated successfully', player.wallets);
  xgResponse(
    res,
    {
      ...player.wallets,
    },
    httpStatus.OK
  );
});

// PUT
const mutatePlayer = wrapRequestAsync(async (req: Request, res: Response) => {
  const { xgContext } = req;
  const { id } = req.params;
  const player = req.body;
  player.gameId = req.game['_id'];

  const playerUpdated = await PlayerService.updatePlayerById(id, player, xgContext);

  req.logger?.info('Player was modified successfully', playerUpdated);
  xgResponse(res, serializePlayer(playerUpdated), httpStatus.OK);
});

// DELETE
const removePlayer = wrapRequestAsync(async (req: Request, res: Response) => {
  const { xgContext } = req;
  const { id } = req.params;

  const playerDeleted = await PlayerService.deletePlayerById(id, xgContext);

  req.logger?.info('Player was removed successfully', playerDeleted);
  xgResponse(res, serializePlayer(playerDeleted), httpStatus.OK);
});

export const PlayerController = {
  getPlayer,
  getAllPlayers,
  getGamePlayers,
  getInventory,
  createPlayer,
  activatePlayer,
  mutatePlayer,
  removePlayer,
};
