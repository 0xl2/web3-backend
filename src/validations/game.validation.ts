import Joi from 'joi';
import { SORT_ORDER } from '@/types/global';
import { objectId } from './custom.validation';
import { GAME_STATUS, MEDIA_TYPE } from '../models';

const config = Joi.object().keys({
  theme: Joi.object().keys({
    fonts: Joi.object().keys({
      body: Joi.string(),
      heading: Joi.string(),
      monospace: Joi.string(),
    }),
    media: Joi.object().keys({
      logo: Joi.object().keys({
        mediaType: Joi.string().valid(...Object.values(MEDIA_TYPE)),
        mediaUrl: Joi.string().uri(),
        clickUrl: Joi.string().uri(),
      }),
      hero: Joi.object().keys({
        mediaType: Joi.string().valid(...Object.values(MEDIA_TYPE)),
        mediaUrl: Joi.string().uri(),
        clickUrl: Joi.string().uri(),
      }),
      banner: Joi.object().keys({
        mediaType: Joi.string().valid(...Object.values(MEDIA_TYPE)),
        mediaUrl: Joi.string().uri(),
        clickUrl: Joi.string().uri(),
      }),
      timed_promo: Joi.object().keys({
        mediaType: Joi.string().valid(...Object.values(MEDIA_TYPE)),
        mediaUrl: Joi.string().uri(),
        clickUrl: Joi.string().uri(),
      }),
      lootbox: Joi.object().keys({
        mediaType: Joi.string().valid(...Object.values(MEDIA_TYPE)),
        mediaUrl: Joi.string().uri(),
        clickUrl: Joi.string().uri(),
      }),
      extra: Joi.object().pattern(Joi.string(), Joi.any()).allow({}).default({}),
    }),
    colors: Joi.object().keys({
      'card-color': Joi.string(),
      'text-color': Joi.string(),
      'highlight-color': Joi.string(),
      'background-color': Joi.string(),
      'background-color2': Joi.string(),
    }),
  }),
});

const gameConfig = Joi.object().keys({
  emails: Joi.object().keys({
    web3link: Joi.object().keys({
      subject: Joi.string(),
      imageUrl: Joi.string().uri(),
      gameTitle: Joi.string(),
      gameSubTitle: Joi.string(),
      rarityBoxes: Joi.array().items(Joi.string()),
    }),
  }),
});

const getGames = {
  query: Joi.object().keys({
    status: Joi.string().valid(...Object.values(GAME_STATUS)),
    sortBy: Joi.string(),
    orderBy: Joi.string().valid(...Object.values(SORT_ORDER)),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getGame = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const createGame = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string(),
    mediaUrl: Joi.string().uri().required(),
    imageUrl: Joi.string().uri().required(),
    chainName: Joi.string().required(),
    config,
    gameConfig,
  }),
};

const deployGameContract = {
  params: Joi.object().keys({
    network: Joi.string().required(),
  }),
  body: Joi.object().keys({
    contractMetadata: Joi.object().keys({
      name: Joi.string().required(),
      symbol: Joi.string().required(),
      gameId: Joi.string().required(),
      baseURI: Joi.string().uri().required(),
      imxCore: Joi.string(),
    }),
    gameId: Joi.string().required(),
  }),
};

const generateNewKey = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

const mutateGame = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object({
    shortId: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
    imageUrl: Joi.string(),
    mediaUrl: Joi.string(),
    chainName: Joi.string(),
    config,
  }),
};

const mutateGameStyleConfig = {
  body: Joi.object({
    config,
  }),
};

const removeGame = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

export const GameValidation = {
  getGame,
  getGames,
  createGame,
  deployGameContract,
  generateNewKey,
  mutateGame,
  mutateGameStyleConfig,
  removeGame,
};
