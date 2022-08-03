import Joi from 'joi';

const getToken = {
  query: Joi.object().keys({
    // TODO
  }),
};

const mintToken = {
  body: Joi.object().keys({
    address: Joi.string().min(1),
    email: Joi.string().min(1),
    externalId: Joi.string().min(1),
    amount: Joi.number().positive().required(),
    gameTokenId: Joi.string().required(),
    imageUrl: Joi.string().uri().required(),
    attributes: Joi.object().required()
  }).or('address', 'email', 'externalId'),
};

const bulkMintToken = {
  body: Joi.object({
    address: Joi.string().required(),
    tokens: Joi.array().items(Joi.object({
      amount: Joi.number().positive().required(),
      gameTokenId: Joi.string().required()
    })),
  }),
};

const transferToken = {
  query: Joi.object().keys({
    // TODO
  }),
};

const burnToken = {
  body: Joi.object().keys({
    address: Joi.string().required(),
    amount: Joi.number().positive().required(),
    shortTokenId: Joi.string().required()
  }),
};

const bulkBurnToken = {
  body: Joi.object({
    address: Joi.string().required(),
    tokenIds: Joi.array().items(Joi.object({
      amount: Joi.number().positive().required(),
      shortTokenId: Joi.string().required()
    })),
  }),
}

const mutateToken = {
  query: Joi.object().keys({
    // TODO
  }),
};

const removeTokenProperty = {
  query: Joi.object().keys({
    // TODO
  }),
};

export const TokenValidation = {
  getToken,
  mintToken,
  bulkMintToken,
  transferToken,
  burnToken,
  bulkBurnToken,
  mutateToken,
  removeTokenProperty,
};
