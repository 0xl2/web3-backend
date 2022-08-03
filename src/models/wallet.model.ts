import { model, Model, Schema, Types } from 'mongoose';
import { PaginatedModel } from './types';
import { toJSON, excludeDeletedItems } from './plugins';

export interface IWallet extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  chainName: string;
  publicKey: string;
  privateKey: string;
}

export interface WalletModel extends Model<IWallet>, PaginatedModel<IWallet> {}

const chainWalletSchema = new Schema<any, WalletModel>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    chainName: {
      type: String,
      trim: true,
      required: true,
    },
    publicKey: {
      type: String,
      trim: true,
      required: true,
    },
    privateKey: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
chainWalletSchema.plugin(toJSON);
chainWalletSchema.plugin(excludeDeletedItems);

/**
 * @typedef Wallets
 */
export const Wallet = model<IWallet, WalletModel>('Wallet', chainWalletSchema);
