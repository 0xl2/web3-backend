import crypto from 'crypto';
import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import { ApiKey, API_KEY_STATUS, API_KEY_TYPE, IApiKey } from '@/models/apiKey.model';
import { SaveOptions, Types } from 'mongoose';
import { Logger } from '@/config/logger';

export interface CreateApiKeyDto {
  gameId: Types.ObjectId;
  issuer: Types.ObjectId;
}

const generateApiKey = (createModel: CreateApiKeyDto, options: SaveOptions) => {
  const apiKeyValue = crypto.randomUUID();

  const apiKeyDto: Partial<IApiKey> = {
    value: apiKeyValue,
    gameId: createModel.gameId,
    issuer: createModel.issuer,
    type: API_KEY_TYPE.API_KEY,
    status: API_KEY_STATUS.ACTIVE,
  };

  Logger.info('Create ApiKey', apiKeyDto);
  return ApiKey.create([apiKeyDto], options);
};

const getApiKeyById = (id: string) => ApiKey.findById(id);

const getApiKeyByValue = (value: string) => ApiKey.findOne({ value });

const getApiKeysByGame = (gameId: string) => ApiKey.find({ gameId, status: API_KEY_STATUS.ACTIVE });

const updateApiKeyStatus = async (id: string, status: API_KEY_STATUS) => {
  Logger.info(`Fetching api-key ${id}`);

  const apiKey = await ApiKey.findByIdAndUpdate(id, { status }, (err, docs) => {
    if (err) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ApiKey not found');
    } else {
      Logger.info(`Revokin api-key ${id}`);
    }
  });

  return apiKey;
};

export const ApiKeyService = {
  getApiKeyById,
  getApiKeyByValue,
  getApiKeysByGame,
  generateApiKey,
  updateApiKeyStatus,
};
