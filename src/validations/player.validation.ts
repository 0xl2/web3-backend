import { SORT_ORDER } from '@/types/global';
import Joi from 'joi';
import { objectId } from './custom.validation';

const getPlayers = {
  query: Joi.object().keys({
    game: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPlayer = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const getPlayerByExternalId = {
  params: Joi.object().keys({
    externalPlayerId: Joi.string().custom(objectId),
  }),
};

const activatePlayer = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    chainName: Joi.string().required(),
  }),
};

const createPlayer = {
  body: Joi.object().keys({
    externalPlayerId: Joi.string().max(22).required(),
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    chainName: Joi.string(),
    address: Joi.string(),
  }),
};

const mutatePlayer = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object({
    externalPlayerId: Joi.string(),
    game: Joi.string(),
    name: Joi.string(),
    email: Joi.string(),
    metadata: Joi.object(),
    events: Joi.object(),
  }),
};

const deletePlayer = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const getPlayerId = {
  query: Joi.object().keys({
    // TODO
  }),
};

const getPlayerIds = {
  query: Joi.object().keys({
    // TODO
  }),
};

const getPlayerInventory = {
  query: Joi.object().keys({
    // TODO
  }),
};

const getPlayerCount = {
  query: Joi.object().keys({
    // TODO
  }),
};

const getAllPlayers = {
  query: Joi.object().keys({
    // TODO
    sortBy: Joi.string(),
    page: Joi.number().integer(),
    limit: Joi.number().integer(),
  }),
};

const removePlayer = {
  query: Joi.object().keys({
    // TODO
  }),
};

const removePlayerProperty = {
  query: Joi.object().keys({
    // TODO
  }),
};

export const PlayerValidation = {
  getPlayer,
  getPlayerId,
  getPlayerByExternalId,
  getPlayerIds,
  getPlayerInventory,
  getPlayerCount,
  getAllPlayers,
  createPlayer,
  mutatePlayer,
  removePlayer,
  removePlayerProperty,
  getPlayers,
  deletePlayer,
  activatePlayer,
};
