import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { Logger } from '@/config/logger';
import { GAME_STATUS, IGame } from '@/models';
import { checkDocExists } from '@/utils/helpers';
import { CONTRACT_TYPE } from '@/models/contract.model';
import { IContractMetadata } from '@/services/web3/types';
import { wrapRequestAsync, xgResponse, ApiError } from '@/utils/api';
import { ContractService, CreateGameDto, GameService } from '@/services';
import { defaultGameStyleConfig, defaultGameConfig } from '@/utils/defaults';
import { createGametransaction, deployGameContractTransaction } from '@/utils/transactionHelpers';

const serializeGame = (game: IGame) => ({
  id: game?._id,
  title: game?.title,
  description: game?.description,
  imageUrl: game?.imageUrl,
  mediaUrl: game?.mediaUrl,
  config: game?.config,
  gameConfig: game.gameConfig,
});

// GET
const getGame = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  req.logger?.info(`Fetching game by id ${req.params.id}`);
  const game = await GameService.getGameById(id);

  checkDocExists(game, `Game with Id ${id} not found`);

  xgResponse(res, serializeGame(game), httpStatus.OK);
});

// GET
const getMyGame = wrapRequestAsync(async (req: Request, res: Response) => {
  req.logger?.info(`Fetching game ${req.user['gameId']} requested by user ${req.user['id']}`);
  const game = req.game;

  xgResponse(res, serializeGame(game), httpStatus.OK);
});

// POST
const createGame = wrapRequestAsync(async (req: Request, res: Response) => {
  const game = req.body;
  const { user } = req;

  const gameExists = await GameService.queryGames(
    {
      title: game.title.trim(),
    },
    {}
  );

  if (gameExists.results.length !== 0) {
    throw new ApiError(httpStatus.CREATED, `Game with name ${game.title} exists`);
  }

  const gameDto: CreateGameDto = {
    title: game.title,
    description: game.description,
    imageUrl: game.imageUrl,
    mediaUrl: game.mediaUrl,
    config: game.config || defaultGameStyleConfig,
    gameConfig: game.gameConfig || defaultGameConfig,
    status: GAME_STATUS.PENDING,
    contracts: {},
  };

  const [gameCreated] = await GameService.createTransaction<ReturnType<typeof GameService.createGame>>(
    async (tx: any) =>
      await createGametransaction({
        tx,
        user,
        gameDto,
      })
  );

  req.logger?.info('Game created successfully', gameCreated);
  xgResponse(
    res,
    {
      ...serializeGame(gameCreated),
    },
    httpStatus.CREATED
  );
});

// PUT
const deployGameContract = wrapRequestAsync(async (req: Request, res: Response) => {
  const { xgContext } = req;
  const { id, chainName } = req.params;
  const { constructorParams } = req.body;

  const contractMetadata: IContractMetadata = {
    name: constructorParams.name,
    symbol: constructorParams.symbol,
    gameId: constructorParams.gameId,
    baseURI: constructorParams.baseURI,
    imxCore: constructorParams.imxCore,
  };

  const contractDto = await ContractService.getContractBy({
    chainName: chainName,
    type: CONTRACT_TYPE.ERC721,
  });

  const [gameContractDeployed] = await GameService.createTransaction<ReturnType<typeof ContractService.deployGameContract>>(
    async (tx: any) =>
      await deployGameContractTransaction({
        contractDto,
        contractMetadata,
        tx,
      })
  );

  let gameBody = await GameService.getGameByGameId(id);
  gameBody.contracts[chainName] = gameContractDeployed._id;

  const gameUpdated = await GameService.updateGameById(id, xgContext, gameBody);

  Logger.info('Game updated successfully', gameUpdated);
  xgResponse(
    res,
    {
      ...serializeGame(gameUpdated),
    },
    httpStatus.OK
  );
});

// PUT
const mutateGame = wrapRequestAsync(async (req: Request, res: Response) => {
  const game = req.game;
  const { xgContext } = req;
  const updateBody = req.body;

  const gameUpdated = await GameService.updateGameById(game._id.toString(), xgContext, updateBody);

  req.logger?.info('Update game complete successfully', gameUpdated);
  xgResponse(res, serializeGame(gameUpdated), httpStatus.OK);
});

// DELETE
const removeGame = wrapRequestAsync(async (req: Request, res: Response) => {
  const { xgContext } = req;
  const { id } = req.params;

  const gameDeleted = await GameService.deleteGameById(id, xgContext);

  req.logger?.info('Remove game complete successfully', gameDeleted);
  xgResponse(res, serializeGame(gameDeleted), httpStatus.OK);
});

export const GameController = {
  getGame,
  getMyGame,
  createGame,
  deployGameContract,
  mutateGame,
  removeGame,
};
