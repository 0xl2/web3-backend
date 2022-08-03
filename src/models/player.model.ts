import validator from 'validator';
import * as bcrypt from 'bcryptjs';
import { Model, model, Schema, Types } from 'mongoose';
import { toJSON, paginate, excludeDeletedItems } from './plugins';
import { IEvent, IPaginatedResults, IWallet, PaginatedModel } from './types';

export enum PLAYER_STATUS {
  INIT = 'init',
  ACTIVE = 'active',
}

export interface IPlayer extends Document {
  _id: Types.ObjectId;
  externalPlayerId: string;
  gameId: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  wallets: {
    [chainName: string]: IWallet;
  };
  externalLoginToken?: string;
  status: PLAYER_STATUS;
  metadata?: Record<string, string>;
  events?: IEvent[];

  isExternalIdMatch(externalId: string): Promise<boolean>;
  activate(): void;
}

export interface PlayerModel extends Model<IPlayer>, PaginatedModel<IPlayer> {
  isEmailTaken(email: string, gameId: string, excludeUserId?: Types.ObjectId): boolean;
  paginate(filter: any, options: any): Promise<IPaginatedResults<IPlayer>>;
}

const playerSchema = new Schema<any, PlayerModel>(
  {
    externalPlayerId: {
      type: String,
      required: true,
      trim: true,
    },
    externalLoginToken: {
      type: String,
      trim: true,
    },
    gameId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object,
      required: false,
    },
    status: {
      type: PLAYER_STATUS,
      required: true,
    },
    events: {
      type: Array,
      required: false,
      default: [],
    },
    wallets: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to jsisExternalIdMatch
playerSchema.plugin(toJSON);
playerSchema.plugin(paginate);
playerSchema.plugin(excludeDeletedItems);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
playerSchema.statics.isEmailTaken = async function (email, gameId, excludeUserId) {
  const player = await this.findOne({ email, gameId, _id: { $ne: excludeUserId } });
  return !!player;
};

/**
 * Check if player guid matches the player's player guid
 * @param {string} guid
 * @returns {Promise<boolean>}
 */
playerSchema.methods.isExternalIdMatch = async function (externalPlayerId: string): Promise<boolean> {
  const player = this;
  return externalPlayerId === player.externalLoginToken;
};

/**
 * Check if player id matches the player's player id
 * @param {string} externalPlayerId
 * @returns {Promise<boolean>}
 */
playerSchema.methods.activate = async function () {
  const player = this;
  player.status = PLAYER_STATUS.ACTIVE;
};

/**
 * @typedef Player
 */
export const Player = model<IPlayer, PlayerModel>('Player', playerSchema);
