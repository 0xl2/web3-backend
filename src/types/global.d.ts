import winston from 'winston';
import { Types } from 'mongoose';
import { IGame } from '@/models';
import { IXgContext } from './global';
import { ROLES } from '../config/roles';
import { IOptions } from '@/types/global';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      name: string;
      email: string;
      role: ROLES;
      isEmailVerified: boolean;
      gameId?: string;
    }

    interface Request {
      apiKey?: string;
      game?: IGame;
      user?: User | Player;
      options?: IOptions;
      filters?: Record<string, any>;
      chainName?: string;
      logger?: winston.Logger;
      xgContext?: IXgContext;
    }
  }
}
