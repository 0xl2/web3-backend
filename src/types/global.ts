import { Types } from 'mongoose';
import { IPlayer, IUser } from '@/models';

export interface XGResponseMetaPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface XGResponseMeta {
  pagination?: XGResponseMetaPagination;
}

export interface XGResponse<T = unknown> {
  status: 'OK' | 'ERROR';
  data: T;
  meta: XGResponseMeta;
  error: string | null;
}

export enum SORT_ORDER {
  DESC = 'desc',
  ASC = 'asc',
}

export enum IMMUTABLEX_SORT_ORDER {
  CREATED_AT = 'created_at',
  NAME = 'name',
}

export interface IOptions {
  sortBy?: string;
  orderBy?: SORT_ORDER | IMMUTABLEX_SORT_ORDER;
  limit?: number;
  page?: number;
  cached?: boolean;
}

export type typeOfUser = Partial<IPlayer & IUser>;

export interface IXgContext {
  user_id: Types.ObjectId;
  user_email: string;
  game_id: Types.ObjectId;
  game_title: string;
  is_public: boolean;
}
