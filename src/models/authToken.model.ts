import mongoose, { model, Model, Schema, Types } from 'mongoose';
import { AuthTokenTypes } from '@/config/authTokenTypes';
import { PaginatedModel } from './types';
import { toJSON, excludeDeletedItems } from './plugins';

export interface IAuthToken extends Document {
  _id: Types.ObjectId;
  token: string;
  user: string;
  type: string;
  expires: Date;
  blacklisted: boolean;
}

export interface AuthTokenModel extends Model<IAuthToken>, PaginatedModel<IAuthToken> {}

const authTokenSchema = new Schema<any, AuthTokenModel>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [AuthTokenTypes.REFRESH, AuthTokenTypes.RESET_PASSWORD, AuthTokenTypes.VERIFY_EMAIL],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
authTokenSchema.plugin(toJSON);
authTokenSchema.plugin(excludeDeletedItems);

/**
 * @typedef AuthTokens
 */
export const AuthToken = model<IAuthToken, AuthTokenModel>('AuthToken', authTokenSchema);
