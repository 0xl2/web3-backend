import Joi from 'joi';
import { objectId } from './custom.validation';

const getQuote = {
  query: Joi.object().keys({
    gt: Joi.string().custom(objectId).required(),
  }),
};

const requestPayment = {
  body: Joi.object().keys({
    quoteId: Joi.string().required(),
  }),
};

const subscribe = {
  params: Joi.object().keys({
    paymentId: Joi.string().required(),
  }),
};

export const PaymentValidation = {
  getQuote,
  requestPayment,
  subscribe,
};
