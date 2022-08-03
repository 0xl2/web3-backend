import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { IGame } from '@/models';
import { checkDocExists } from '@/utils/helpers';
import { GameService, GameTokenService } from '@/services';
import { wrapRequestAsync, xgResponse } from '@/utils/api';

const serializeGame = (game: IGame) => ({
  id: game?._id,
  title: game?.title,
  description: game?.description,
  imageUrl: game?.imageUrl,
  mediaUrl: game?.mediaUrl,
  status: game?.status,
  config: game?.config,
  contracts: game?.contracts,
  metadata: {
    immutableXProjectId: game?.meta.immutableXProjectId,
  },
  gameConfig: game.gameConfig,
});

// GET
const getGame = wrapRequestAsync(async (req: Request, res: Response) => {
  const { user } = req;

  req.logger?.info('Get game by id', user.gameId);
  const game = await GameService.getGameById((user as any).gameId);

  checkDocExists(game, `Game with id - ${user.gameId} not found`);

  xgResponse(res, serializeGame(game));
});

const getCatalog = wrapRequestAsync(async (req: Request, res: Response) => {
  const gameTokens = await GameTokenService.queryGameTokens(
    req.user.gameId.toString(),
    {
      ...req.filters,
    },
    req.options
  );

  xgResponse(
    res,
    {
      results: gameTokens.results.map((gt) => ({
        id: gt._id,
        gameId: gt.gameId,
        cap: gt.cap,
        name: gt.name,
        type: gt.type,
        minted: gt.minted,
        imageUrl: gt.imageUrl,
        sale: gt.sale,
        chainName: gt.chainName,
        symbol: gt.symbol,
      })),
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

export const GameController = {
  getGame,
  getCatalog,
};
