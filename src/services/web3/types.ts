import { NullableType } from 'joi';
import { IOptions } from '@/types/global';
import { CHAIN_TYPE } from '@/config/config';
import { IContract } from '@/models/contract.model';
import { BigNumber } from '@ethersproject/bignumber';
import { CreateGameDto } from '../game.service';
import { SaveOptions } from 'mongoose';

export type IAssets = Partial<{
  id: string;
  token_id: string;
  token_hash: string;
  name: string;
  block_number_minted: string;
  token_address: string;
  status: string;
  network: CHAIN_TYPE;
  metadata: Record<string, string>;
  collection: {
    name: string;
    icon_url: string;
  };
  created_at: string;
  synced_at: string;
  image_url: string;
  updated_at: string;
  uri: string;
  user: string;
  owner_of: string;
  block_number: string;
  amount: string;
  contract_type: string;
  symbol: string;
  token_uri: string;
  is_valid: number;
  syncing: number;
  frozen: number;
}>;

export type ITransaction = Partial<{
  hash: string;
  to: string;
  from: string;
  nonce: number;
  gasLimit: BigNumber;
  gasPrice: BigNumber;
  data: string;
  tokenId: string;
  value: BigNumber;
  chainId: number;
  url: string;
}>;

export interface CreateGameWeb3 {
  name_: string;
  treasuryWallet_: string;
}

export interface CreateGameTokenWeb3 {
  name_: string;
  symbol_: string;
  isNFT_: boolean;
  cap_: string;
}

export interface MintWeb3 {
  to_: string;
  gameTokenId_: string;
  amount_: number;
  gameId: string;
}

export interface IMintWeb3 extends MintWeb3 {
  id_: string;
  meta_: string;
}

export interface BulkMintWeb3 {
  to_: string;
  gameTokenIds_: number[];
  amounts_: number[];
}

export interface BurnTokenWeb3 {
  from_: string;
  id_: string;
  amount_: number;
}

export interface BulkBurnTokenWeb3 {
  from_: string;
  ids_: string[];
  amounts_: number[];
}


export interface IContractMetadata {
  name: string;
  symbol: string;
  gameId: number;
  baseURI: string;
  imxCore: string;
}

export type ContractWeb3 = IContract;

export interface IWeb3Client {
  start: () => Promise<unknown>;
  getAssets: (gameContract: ContractWeb3, address: string, options?: NullableType<IOptions>) => Promise<IAssets>;
  // createGame: (params: CreateGameWeb3, contract: ContractWeb3) => Promise<ITransaction>;
  // createGameToken: (params: CreateGameTokenWeb3, contract: ContractWeb3) => Promise<ITransaction>;
  mint: (params: MintWeb3, contract: ContractWeb3) => Promise<ITransaction>;
  // bulkMint: (params: BulkMintWeb3, contract: ContractWeb3) => Promise<ITransaction>;
  burnToken: (params: BurnTokenWeb3, contract: ContractWeb3) => Promise<ITransaction>;
  // bulkBurnToken: (params: BulkBurnTokenWeb3, contract: ContractWeb3) => Promise<ITransaction>;
}
