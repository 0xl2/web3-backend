import Joi from 'joi';
import { objectId } from './custom.validation';
import { ATTRIBUTE_TYPE, GAME_TOKEN_TYPE, SALE_TYPE } from '@/models/gameToken.model';

const getGameToken = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const getPublicGameToken = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
    gameId: Joi.string(),
  }),
};

const getAllGameTokens = {};

const getAllPublicGameTokens = {
  params: Joi.object().keys({
    gameId: Joi.string(),
  }),
};

const getGameTokenCount = {};

const createGameToken = {
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      cap: Joi.number().positive().required(),
      type: Joi.string().valid(...Object.values(GAME_TOKEN_TYPE)),
      attributes: Joi.object()
        .pattern(
          /^.+$/,
          Joi.object({
            type: Joi.string().valid(...Object.values(ATTRIBUTE_TYPE)),
            values: Joi.array().allow(null).items(Joi.string(), Joi.number()).default(null),
            autoSelected: Joi.boolean().default(false),
            autoSelectedValue: Joi.any().default(null),
          })
        )
        .required(),
      chainName: Joi.string().required(),
      symbol: Joi.string().required(),
      imageUrl: Joi.string().uri().required(),
      sale: Joi.object().keys({
        type: Joi.string().valid(...Object.values(SALE_TYPE)),
        price: Joi.number().positive(),
      }),
    })
    .custom((obj, helpers) => {
      if (obj.type === 'NFT' && obj.cap > 10000) {
        return helpers.error('Max cap for NFT is 10000');
      }

      if (obj.type === 'FT' && obj.cap > 1000000) {
        return helpers.error('Max cap for FT is 1000000');
      }

      return obj;
    }),
};

const mutateGameToken = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().required(),
};

const removeGameToken = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const removeGameTokenProperty = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.array().items(Joi.string()).required(),
};

export const GameTokenValidation = {
  getGameToken,
  getPublicGameToken,
  getAllGameTokens,
  getAllPublicGameTokens,
  getGameTokenCount,
  createGameToken,
  mutateGameToken,
  removeGameToken,
  removeGameTokenProperty,
};
