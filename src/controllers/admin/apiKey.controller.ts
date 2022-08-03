import { Types } from 'mongoose';
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { ApiKeyService } from '@/services/apiKey.service';
import { API_KEY_STATUS, IApiKey } from '@/models/apiKey.model';
import { ApiError, wrapRequestAsync, xgResponse } from '@/utils/api';

const serializeApiKey = (apiKey: IApiKey) => ({
  id: apiKey?._id,
  value: apiKey?.value,
  issuer: apiKey?.issuer,
  created: apiKey?.createdAt.toISOString(),
  status: apiKey?.status,
  type: apiKey?.type,
});

// GET
const getKeysForGame = wrapRequestAsync(async (req: Request, res: Response) => {
  const { user } = req;

  if (!user.gameId) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't have any game");
  }

  req.logger?.info(`Fetching keys for game by gameId ${user.gameId}`);
  const keys = await ApiKeyService.getApiKeysByGame(user.gameId.toString());

  xgResponse(res, keys.map(serializeApiKey));
});

// POST
const createNewApiKey = wrapRequestAsync(async (req: Request, res: Response) => {
  const { user } = req;

  req.logger?.info(`Creating new api key for user - ${user._id} game - ${user.gameId}`);
  const [key] = await ApiKeyService.generateApiKey(
    {
      gameId: Types.ObjectId(user.gameId),
      issuer: user._id,
    },
    {}
  );

  xgResponse(res, serializeApiKey(key), httpStatus.CREATED);
});

// PUT
const revokeApiKey = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const key = await ApiKeyService.updateApiKeyStatus(id, API_KEY_STATUS.INACTIVE);

  req.logger?.info('ApiKey successfully revoked', key);
  xgResponse(res, serializeApiKey(key));
});

export const ApiKeyController = {
  getKeysForGame,
  createNewApiKey,
  revokeApiKey,
};
