import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { checkDocExists } from '@/utils/helpers';
import { wrapRequestAsync, xgResponse } from '@/utils/api';
import { GameTokenService } from '@/services/gameToken.service';

const serializeGameToken = (gameToken) => ({
  id: gameToken.id,
  gameId: gameToken.gameId,
  cap: gameToken.cap,
  name: gameToken.name,
  type: gameToken.type,
  minted: gameToken.minted,
  imageUrl: gameToken.imageUrl,
  attributes: gameToken.attributes,
  chainId: gameToken.chainId,
  chainName: gameToken.chainName,
  shortTokenId: gameToken.shortTokenId,
  symbol: gameToken.symbol,
  status: gameToken.status,
  createdAt: gameToken.createdAt,
  sale: gameToken.sale,
});

// GET
const getGameToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id, gameId } = req.params;

  req.logger?.info(`Get GameTaken by id - ${id} gameId - ${gameId}`);
  const gameToken = await GameTokenService.getGameTokenById(id);

  checkDocExists(gameToken, `Game token with Id ${id} not found`);

  xgResponse(res, serializeGameToken(gameToken), httpStatus.OK);
});

const getAllGameTokens = wrapRequestAsync(async (req: Request, res: Response) => {
  const { options } = req;
  const { gameId } = req.params;

  req.logger?.info(`Get GameTokens by gameId - ${gameId}`);
  const gameTokens = await GameTokenService.getAllGameTokens(gameId.toString(), options);

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

export const GameTokenController = {
  getGameToken,
  getAllGameTokens,
};
