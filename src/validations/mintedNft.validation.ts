import Joi from 'joi';
import { SORT_ORDER } from '@/types/global';
import { objectId } from './custom.validation';

const getMintedNftById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const getAllMintedNfts = {};

const getMintedQueriedNfts = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    orderBy: Joi.string().valid(...Object.values(SORT_ORDER)),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    playerId: Joi.string().custom(objectId),
  }),
}

const getMintedNftsByGame = {};

const getMintedNftsByUser = {};

export const MintedNftValidation = {
  getMintedNftById,
  getAllMintedNfts,
  getMintedQueriedNfts,
  getMintedNftsByGame,
  getMintedNftsByUser,
};
