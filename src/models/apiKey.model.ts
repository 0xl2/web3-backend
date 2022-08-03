import mongoose, { Model, model, Schema, Types } from 'mongoose';
import { PaginatedModel } from './types';
import { toJSON, paginate, excludeDeletedItems } from './plugins';

export enum API_KEY_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum API_KEY_TYPE {
  API_KEY = 'api-key',
}

export interface IApiKey extends Document {
  _id: Types.ObjectId;
  status: API_KEY_STATUS;
  value: string;
  gameId: Types.ObjectId;
  issuer: Types.ObjectId;
  type: string;
  createdAt: Date;
  updatedAt: Date;

  isApiKeyMatch(providedApiKey: string): Promise<boolean>;
}

export interface ApiKeyModel extends Model<IApiKey>, PaginatedModel<IApiKey> {}

const apiKeySchema = new Schema<any, ApiKeyModel>(
  {
    value: {
      type: String,
      trim: true,
    },
    issuer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    gameId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Game',
      required: true,
    },
    status: {
      type: API_KEY_STATUS,
    },
    type: {
      type: API_KEY_TYPE,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
apiKeySchema.plugin(toJSON);
apiKeySchema.plugin(paginate);
apiKeySchema.plugin(excludeDeletedItems);

apiKeySchema.methods.isApiKeyMatch = async function (providedApiKey: string): Promise<boolean> {
  const apiKey = this;
  return apiKey.value === providedApiKey;
};

/**
 * @typedef ApiKeys
 */
export const ApiKey = model<IApiKey, ApiKeyModel>('ApiKey', apiKeySchema);
