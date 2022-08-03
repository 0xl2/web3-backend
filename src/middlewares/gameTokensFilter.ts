import Joi from 'joi';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/api';
import { GAME_TOKEN_STATUS, SALE_TYPE } from '@/models/gameToken.model';

export const operations = {
  equal: '[$eq]',
  lower: '[$lt]',
  contain: '[$in]',
  greeter: '[$gt]',
  notContain: '[$nin]',
  noOneNotEqual: '[$ne]',
  lowerOrEqual: '[$lte]',
  greeterOrEqual: '[$gte]',
};

const filtersSchema = {
  price: Joi.string()
    .pattern(/\[(.+?)\]\[(.+?)]/)
    .allow('')
    .default(''),
  cap: Joi.string()
    .pattern(/\[(.+?)\]\[(.+?)]/)
    .allow('')
    .default(''),
  chainName: Joi.string()
    .pattern(/\[(.+?)\]\[(.+?)]/)
    .allow('')
    .default(''),
  saleType: Joi.string()
    .pattern(/\[(.+?)\]\[(.+?)]/)
    .default(`[$eq][${SALE_TYPE.IN_GAME}]`),
  status: Joi.string()
    .pattern(/\[(.+?)\]\[(.+?)]/)
    .default(`[$eq][${GAME_TOKEN_STATUS.ACTIVE}]`),
  minted: Joi.string()
    .pattern(/\[(.+?)\]\[(.+?)]/)
    .allow('')
    .default(''),
  type: Joi.string()
    .pattern(/\[(.+?)\]\[(.+?)]/)
    .allow('')
    .default(''),
};

const mapGameTokenFilterKeys = (key: string) =>
  ({
    cap: 'cap',
    type: 'type',
    status: 'status',
    minted: 'minted',
    chainName: 'chainName',
    price: 'sale.price',
    saleType: 'sale.type',
  }[key]);

export const extractFilters = (req: Request, res: Response, next: NextFunction) => {
  const options = {
    cap: req.query.cap,
    type: req.query.type,
    price: req.query.price,
    status: req.query.status,
    minted: req.query.minted,
    saleType: req.query.saleType,
    chainName: req.query.chainName,
  };

  const { value, error } = Joi.compile(filtersSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(options);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  const filtersQuery = {};

  Object.entries(value).map(([key, value]: [string, string]) => {
    // get operation and value from query string
    const filterParts = value.split(/\[(.+?)\]\[(.+?)]/).filter((piece) => piece.length);

    // create MongoDB filters with MongoDB Comparison Query Operators
    for (let index = 0; index < filterParts.length; index + 2) {
      const value =
        filterParts[index + 1].match(/^[0-9]+$/) && (key !== 'cap' || 'minted')
          ? Number(filterParts[index + 1])
          : filterParts[index + 1];
      return Object.assign(filtersQuery, { [mapGameTokenFilterKeys(key)]: { [filterParts[index]]: value } });
    }
  });

  req.filters = filtersQuery;

  next();
};
