import { Model, model, Schema, Types } from 'mongoose';
import { PaginatedModel } from './types';
import { toJSON, paginate, excludeDeletedItems, transaction } from './plugins';
import { IContractMetadata } from '@/services/web3/types';

export enum CONTRACT_TYPE {
  DEPLOYMENT = 'DEPLOYMENT',
  ERC20 = 'ERC-20',
  ERC721 = 'ERC-721',
  ERC1155 = 'ERC-1155',
}

export enum CONTRACT_STATUS {
  PUBLISHED = 'PUBLISHED',
  STOPPED = 'STOPPED',
}

export interface IContract extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  address: string;
  owner: string;
  chainId: string;
  chainName: string;
  abi: Object[];
  bytecode: string;
  meta: IContractMetadata;
  type: CONTRACT_TYPE;
  status: CONTRACT_STATUS;
  published: Date;
}

export interface ContractModel extends Model<IContract>, PaginatedModel<IContract> {}

const contractSchema = new Schema<any, ContractModel>(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    chainId: {
      type: String,
      required: true,
    },
    chainName: {
      type: String,
      required: true,
    },
    abi: {
      type: [Object],
      required: true,
    },
    bytecode: {
      type: String,
      required: true,
    },
    meta: {
      type: Object,
      required: true,
      default: {},
    },
    type: {
      type: CONTRACT_TYPE,
      required: true,
    },
    status: {
      type: CONTRACT_STATUS,
      required: true,
    },
    published: {
      type: Number,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
contractSchema.plugin(toJSON);
contractSchema.plugin(paginate);
contractSchema.plugin(transaction);
contractSchema.plugin(excludeDeletedItems);

/**
 * Check if contract is active
 * @param {CONTRACT_STATUS} status - contract status
 * @returns {boolean}
 */
contractSchema.statics.isGameActive = (status: CONTRACT_STATUS): boolean => {
  return status === CONTRACT_STATUS.PUBLISHED;
};

/**
 * @typedef Contracts
 */
export const Contract = model<IContract, ContractModel>('Contract', contractSchema);
