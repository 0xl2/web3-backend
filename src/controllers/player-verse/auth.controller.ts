import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { PlayerService } from '@/services';
import { checkDocExists } from '@/utils/helpers';
import { AuthTokenService } from '@/services/authToken.service';
import { ApiError, wrapRequestAsync, xgResponse } from '@/utils/api';

const verifyLogin = wrapRequestAsync(async (req: Request, res: Response) => {
  const playerExternalToken = req.query['ot'] as string;

  const player = await PlayerService.getPlayerByGuid(playerExternalToken);

  checkDocExists(player, `Player with external token - ${playerExternalToken} not found`);

  const isExternalIdMatch = await player.isExternalIdMatch(playerExternalToken);

  if (!isExternalIdMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Guid doesn't match.");
  }

  req.logger?.info('Invalidate player current external token', player._id);
  await PlayerService.invalidatePlayerExternalToken(player);

  const tokens = await AuthTokenService.generateAuthTokens(player);

  xgResponse(res, { tokens });
});

export const AuthController = {
  verifyLogin,
};
