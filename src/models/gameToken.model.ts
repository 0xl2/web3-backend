import { Model, model, Schema, Types } from 'mongoose';
import { IEvent, PaginatedModel } from './types';
import { toJSON, paginate, transaction, excludeDeletedItems } from './plugins';
import { MongoConnector } from '@/connectors';

export enum ATTRIBUTE_TYPE {
  TEXT = 'text',
  RANGE = 'range',
}

export enum GAME_TOKEN_TYPE {
  NFT = 'NFT',
  FT = 'FT',
}

export enum GAME_TOKEN_STATUS {
  INIT = 'init',
  ACTIVE = 'active',
  PAUSED = 'paused',
  DELETED = 'deleted',
  MINTED = 'minted',
}

export enum SALE_TYPE {
  IN_GAME = 'IN_GAME',
  PUBLIC = 'PUBLIC',
  NONE = 'NONE',
}

export interface IAttributeOptions {
  type: ATTRIBUTE_TYPE;
  values?: string[];

  autoSelected: boolean;
  autoSelectedValue?: string;
}

export interface ISaleOptions {
  type: SALE_TYPE;
  price: number;
  currency: string;
}

export interface IGameToken extends Document {
  _id: Types.ObjectId;
  gameId: string;
  cap: string;
  name: string;
  type: GAME_TOKEN_TYPE;
  minted: string;
  imageUrl: string;
  sale: ISaleOptions;
  attributes: Record<string, IAttributeOptions>;
  chainName: string;
  shortTokenId: string;
  symbol: string;
  events: [IEvent];
  status: GAME_TOKEN_STATUS;

  isCapReached(): boolean;
}

export interface GameTokenModel extends Model<IGameToken>, PaginatedModel<IGameToken> {
  transaction<T = unknown>(cb: (tx) => T): Promise<T>;
}

export const gameTokenSchema = new Schema<any, GameTokenModel>(
  {
    gameId: {
      // type: Types.ObjectId,
      // ref: 'Game',
      type: String,
      required: true,
    },
    cap: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    chainName: {
      type: String,
      required: true,
    },
    shortTokenId: {
      type: Number,
    },
    type: {
      type: GAME_TOKEN_TYPE,
      required: true,
    },
    minted: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    symbol: {
      type: String,
      required: true,
    },
    attributes: {
      type: Object,
      default: {},
    },
    sale: {
      type: Object,
      default: {},
    },
    events: {
      type: [Object],
      required: false,
      default: [],
    },
    status: {
      type: GAME_TOKEN_STATUS,
      required: true,
    },
  },
  { timestamps: true }
);

gameTokenSchema.methods.isCapReached = function (): boolean {
  return this.minted === this.cap;
};

// add plugin that converts mongoose to json
gameTokenSchema.plugin(toJSON);
gameTokenSchema.plugin(paginate);
gameTokenSchema.plugin(transaction);
gameTokenSchema.plugin(excludeDeletedItems);
gameTokenSchema.plugin(MongoConnector.AutoIncrement, { inc_field: 'shortTokenId' });

/**
 * @typedef GameTokens
 */
export const GameToken = model<IGameToken, GameTokenModel>('GameToken', gameTokenSchema);
