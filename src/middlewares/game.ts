import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import { GameService } from '@/services';
import { Logger } from '@/config/logger';

export const useGame = async (req: Request, res: Response, next: NextFunction) => {
  const gameId = req.user?.gameId;

  if (!gameId) {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'User has no game.'));
  }

  Logger.info(`Get game by user game id -${gameId}`);
  const game = await GameService.getGameById(gameId.toString());

  if (!game) {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'Invalid Game id.'));
  }

  req.game = game;
  return next();
};
