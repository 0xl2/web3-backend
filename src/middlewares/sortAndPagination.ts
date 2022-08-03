import Joi from 'joi';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/api';
import { IMMUTABLEX_SORT_ORDER, SORT_ORDER } from '@/types/global';

const sortAndPaginationSchema = {
  sortBy: Joi.string().allow('').default(''),
  orderBy: Joi.string().valid(...Object.values(SORT_ORDER), ...Object.values(IMMUTABLEX_SORT_ORDER)),
  limit: Joi.number().integer().default(10),
  page: Joi.number().integer().default(1),
  cached: Joi.boolean().default(true),
};

export const extractSortAndPagination = (req: Request, res: Response, next: NextFunction) => {
  const options = {
    sortBy: req.query.sortBy || 'createdAt',
    orderBy: req.query.orderBy?.toString() || SORT_ORDER.DESC,
    page: req.query.page,
    limit: req.query.limit,
    cached: req.query.cached,
  };

  const { value, error } = Joi.compile(sortAndPaginationSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(options);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  req.options = Object.assign(req.query, value);

  next();
};
