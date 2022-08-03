import { Model, model, Schema, Types } from 'mongoose';
import { MongoConnector } from '@/connectors';
import { IEvent, PaginatedModel } from './types';
import { toJSON, paginate, transaction, excludeDeletedItems } from './plugins';

export enum MEDIA_TYPE {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  GIF = 'GIF',
  TEXT = 'TEXT',
}

interface IGameStylesConfig {
  theme: {
    fonts: {
      body: string;
      heading: string;
      monospace: string;
    };
    media: {
      logo: {
        mediaType: MEDIA_TYPE.IMAGE;
        mediaUrl: URL['href'];
        clickUrl: URL['href'];
      };
      hero: {
        mediaType: MEDIA_TYPE.VIDEO;
        mediaUrl: URL['href'];
        clickUrl: URL['href'];
      };
      banner: {
        mediaType: MEDIA_TYPE.IMAGE;
        mediaUrl: URL['href'];
        clickUrl: URL['href'];
      };
      timed_promo: {
        mediaType: MEDIA_TYPE.TEXT;
        mediaUrl: URL['href'];
        clickUrl: URL['href'];
      };
      lootbox: {
        mediaType: MEDIA_TYPE.IMAGE;
        mediaUrl: URL['href'];
        clickUrl: URL['href'];
      };
      extra: Record<string, unknown>;
    };
    colors: {
      'card-color': string;
      'text-color': string;
      'highlight-color': string;
      'background-color': string;
      'background-color2': string;
    };
  };
}

export type GameStyleConfig = Partial<IGameStylesConfig>;

interface IGameConfig {
  emails: {
    web3link: {
      templateName: string;
      subject: string;
      imageUrl: string;
      gameTitle: string;
      gameSubTitle: string;
      rarityBoxes: Array<string>;
    };
  };
}

export interface IGame extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  mediaUrl: string;
  status: GAME_STATUS;
  shortGameId: string;
  contracts: {
    [chainName: string]: string; // contractId
  };
  meta: {
    immutableXProjectId: number;
  };
  events: [IEvent];
  config: IGameStylesConfig;
  gameConfig: IGameConfig;

  isGameIdMatch(gameId: string): Promise<boolean>;
}

export interface GameModel extends Model<IGame>, PaginatedModel<IGame> {
  isGameActive(status: GAME_STATUS): boolean;
  transaction<T = unknown>(cb: (tx) => T): Promise<T>;
}

export enum GAME_STATUS {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REMOVED = 'REMOVED',
}

const gameSchema = new Schema<any, GameModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: GAME_STATUS,
    },
    shortGameId: {
      type: Number,
    },
    contracts: {
      type: Object,
    },
    meta: {
      type: Object,
      default: {},
    },
    config: {
      type: Object,
      required: false,
      default: {},
    },
    gameConfig: {
      type: Object,
      required: false,
    },
    events: {
      type: [Object],
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
gameSchema.plugin(toJSON);
gameSchema.plugin(paginate);
gameSchema.plugin(transaction);
gameSchema.plugin(excludeDeletedItems);
gameSchema.plugin(MongoConnector.AutoIncrement, { inc_field: 'shortGameId' });

/**
 * Check if game is active
 * @param {GAME_STATUS} status - game status
 * @returns {boolean}
 */
gameSchema.statics.isGameActive = (status: GAME_STATUS): boolean => {
  return status === GAME_STATUS.ACTIVE;
};

gameSchema.methods.isGameIdMatch = async function (gameId: string): Promise<boolean> {
  const game = this;
  return game._id.toString() === gameId;
};

/**
 * @typedef Games
 */
export const Game = model<IGame, GameModel>('Game', gameSchema);
