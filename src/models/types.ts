import { Types } from 'mongoose';

export interface IPaginatedResults<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PaginatedModel<TDocument> {
  paginate(filter: any, options: any): Promise<IPaginatedResults<TDocument>>;
}

export interface IWallet {
  address: string;
  isExternal: boolean;
}

export enum IMintStatus {
  PENDING = 'PENDING',
  MINTED = 'MINTED',
}

export interface IEvent {
  type: string;
  timestamp: string;
  issuer: Types.ObjectId;
  meta: {
    message?: string;
    stackTrace?: string;
    meta?: unknown;
  };
}
