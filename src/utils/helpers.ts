import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import { Logger } from '@/config/logger';
import { IXgContext } from '@/types/global';

export enum EVENT_ACTIONS {
  CREATE = 'create',
  UPDATE = 'update',
  MUTATE = 'mutate',
  MODIFY = 'modify',
  DELETE = 'delete',
}

export const checkDocExists = (doc: unknown, message: string, status = httpStatus.NOT_FOUND) => {
  if (!doc) {
    Logger.info(message);
    throw new ApiError(status, message);
  }
};

export const trackEntityEvent = (
  modelBody: any,
  modelName: string,
  action: EVENT_ACTIONS,
  xgContext: IXgContext,
  options: Record<string, any> = {}
) => {
  const { user_email, user_id } = xgContext;

  const event = {
    timestamp: new Date().toISOString(),
    type: action,
    issuer: { user_email, user_id },
    meta: {
      message: `${modelName} ${action.toUpperCase()}D`,
      meta: options,
    },
  };

  Logger.info(`Tracked ${action} event by user - ${user_email} for ${modelName} with details ${JSON.stringify(event)}`);
  modelBody.events = modelBody.events || [];
  modelBody.events.push(event);
};
