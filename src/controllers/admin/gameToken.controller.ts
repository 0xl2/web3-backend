import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { checkDocExists } from '@/utils/helpers';
import { wrapRequestAsync, xgResponse } from '@/utils/api';
import { GameTokenService } from '@/services/gameToken.service';
import { createGameTokenTransaction } from '@/utils/transactionHelpers';

const serializeGameToken = (gameToken) => ({
  id: gameToken.id,
  gameId: gameToken.gameId,
  cap: gameToken.cap,
  name: gameToken.name,
  type: gameToken.type,
  minted: gameToken.minted,
  imageUrl: gameToken.imageUrl,
  attributes: gameToken.attributes,
  chainName: gameToken.chainName,
  shortTokenId: gameToken.shortTokenId,
  symbol: gameToken.symbol,
  status: gameToken.status,
  createdAt: gameToken.createdAt,
  sale: gameToken.sale,
});

// GET
const getGameToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  req.logger?.info(`Get GameTaken by id - ${id}`);
  const gameToken = await GameTokenService.getGameTokenById(id);

  checkDocExists(gameToken, `Game Token with Id ${id} not found`);

  xgResponse(res, serializeGameToken(gameToken), httpStatus.OK);
});

const getAllGameTokens = wrapRequestAsync(async (req: Request, res: Response) => {
  const { game, options } = req;

  req.logger?.info(`Get GameTokens by gameId - ${game._id}`);
  const gameTokens = await GameTokenService.getAllGameTokens(game._id.toString(), options);

  xgResponse(
    res,
    {
      results: gameTokens.results.map(serializeGameToken),
    },
    httpStatus.OK,
    {
      pagination: {
        page: gameTokens.page,
        limit: gameTokens.limit,
        totalPages: gameTokens.totalPages,
        totalResults: gameTokens.totalResults,
      },
    }
  );
});

const getGameTokenCount = wrapRequestAsync(async (req: Request, res: Response) => {
  const { game } = req;

  req.logger?.info(`Get GameTokensCount by gameId - ${game._id}`);
  const count = await GameTokenService.getGameTokensCount(game._id.toString());

  xgResponse(res, { count }, httpStatus.OK);
});

// POST
const createGameToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const { game, body } = req;
  req.logger?.info(`Creating game token for game ${game._id} user request: ${req.user._id}`);
  const [gameToken] = await GameTokenService.createTransaction<ReturnType<typeof GameTokenService.createGameToken>>(
    async (tx) => createGameTokenTransaction({ tx, game, body, userId: req.user._id })
  );

  xgResponse(res, { id: gameToken._id }, httpStatus.CREATED);
});

// PUT
const mutateGameToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { game, body, xgContext } = req;

  req.logger?.info(`Mutate GameToken by id - ${id} gameId - ${game._id}`);
  await GameTokenService.mutateGameToken(id, game._id.toString(), xgContext, body);

  xgResponse(res, {}, httpStatus.OK);
});

// DELETE
const deleteGameToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { game, xgContext } = req;

  req.logger?.info(`Delete GameToken by id - ${id} gameId - ${game._id}`);
  await GameTokenService.deleteGameToken(id, game._id.toString(), xgContext);

  xgResponse(res, {}, httpStatus.OK);
});

const removeGameTokenProperty = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { game, body, xgContext } = req;

  req.logger?.info(`Remove GameToken by id - ${id} gameId - {game._id}`);
  await GameTokenService.removeGameTokenAttribute(id, game._id.toString(), xgContext, body);

  xgResponse(res, {}, httpStatus.OK);
});

export const GameTokenController = {
  getGameToken,
  getAllGameTokens,
  getGameTokenCount,
  createGameToken,
  mutateGameToken,
  deleteGameToken,
  removeGameTokenProperty,
};
