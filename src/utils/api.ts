import { Request, Response, NextFunction } from 'express';
import { Logger } from '@/config/logger';
import { IXgContext, XGResponse, XGResponseMeta } from '@/types/global';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const wrapRequestAsync = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  const xgContext: IXgContext = {
    user_id: req.user?._id,
    user_email: req.user?.email,
    game_id: req.game?._id,
    game_title: req.game?.title,
    is_public: !Boolean(req.user),
  };

  req.xgContext = xgContext;
  req.logger = Logger.child({ context: xgContext });

  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const xgResponse = <T>(
  res: Response,
  data: T,
  status: number = 200,
  meta: XGResponseMeta = {},
  error: string = ''
) => {
  const responseData: XGResponse<T> = {
    status: status >= 400 ? 'ERROR' : 'OK',
    data,
    meta,
    error,
  };

  return res.status(status).json(responseData);
};
