import { Model, model, Schema, Types, SchemaTypes } from 'mongoose';
import { PaginatedModel, IMintStatus } from './types';
import { toJSON, paginate, transaction, excludeDeletedItems } from './plugins';

export interface IMintedNFT extends Document {
  _id: Types.ObjectId;
  name: string;
  issuer: Types.ObjectId;
  gameId: string;
  tokenId: string;
  gameTokenId: string;
  from: string;
  to: string;
  transactionHash: string;
  marketUrl: string;
  chainName: string;
  status: IMintStatus;
  imageUrl: string;
  playerId: string;
  playerEmail: string;
  blockNumber: string;
  contractAddress: string;
}

export interface MintedNFTSModel extends Model<IMintedNFT>, PaginatedModel<IMintedNFT> {
  transaction<T = unknown>(cb: (tx) => T): Promise<T>;
}

const mintedNFTSSchema = new Schema<any, MintedNFTSModel>(
  {
    tokenId: {
      type: String,
    },
    gameTokenId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    issuer: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
      required: false,
    },
    marketUrl: {
      type: String,
      required: false,
    },
    chainName: {
      type: String,
      required: true,
    },
    status: {
      type: IMintStatus,
      required: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    playerId: {
      type: String,
      required: true,
    },
    playerEmail: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: String,
      required: false,
    },
    contractAddress: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
mintedNFTSSchema.plugin(toJSON);
mintedNFTSSchema.plugin(paginate);
mintedNFTSSchema.plugin(transaction);
mintedNFTSSchema.plugin(excludeDeletedItems);

/**
 * @typedef mintedNFTS
 */
export const MintedNFTS = model<IMintedNFT, MintedNFTSModel>('MintedNFTS', mintedNFTSSchema);
