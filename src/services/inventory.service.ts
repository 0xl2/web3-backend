import { NullableType } from 'joi';
import { Logger } from '@/config/logger';
import { IGame, IPlayer } from '@/models';
import { IOptions } from '@/types/global';
import { web3Clients, Web3Service } from './web3';
import { ContractService } from './contract.service';
import { MintedNFTSService } from './mintedNFTS.service';
import { IMMUTABLEX_SORT_ORDER, SORT_ORDER } from '@/types/global';

/**
 * Fetches player inventory from chain
 * @param playerId player to fetch inventory for
 * @param apiKey game api key for inventory
 */
const getInventoryForChain = async (
  address: string,
  network: string,
  contractId: string,
  options: NullableType<IOptions>
) => {
  const client = Web3Service.getChainInfo(network).client;
  const web3Client = Web3Service.getWeb3Client(client as web3Clients);
  const contract = await ContractService.getContractById(contractId);

  if (!contract || !address) {
    return [];
  }

  Logger.info(`Get player inventory from chain by client - ${client} contract - ${contract} player chain inventory`);
  const assets = await web3Client.getAssets(contract, address, options);

  return assets || [];
};

/**
 * Fetches player inventory
 * @param playerId player to fetch inventory for
 */
const getInventoryForLocal = async (player: IPlayer, shortGameId: string, options: any) => {
  let nfts;

  if (!player) {
    return [];
  }

  Object.values(player.wallets).map((wallet) => {
    nfts = MintedNFTSService.getMintedNFTSQuery({ to: wallet.address, gameId: shortGameId }, options || {});
  });

  return await nfts;
};

const getPlayerInventory = async (player: IPlayer, game: IGame, options: any) => {
  const results = [];

  if (options.cached) {
    return await getInventoryForLocal(player as IPlayer, game.shortGameId, {
      orderBy: options.orderBy in SORT_ORDER ? options.orderBy : SORT_ORDER.DESC,
      sortBy: options.sortBy,
      page: options.page,
      limit: options.limit,
    });
  }

  Object.entries(player.wallets).forEach(async ([network, { address }]) => {
    results.push(
      getInventoryForChain(address, network, game.contracts[network], {
        orderBy: options.orderBy in IMMUTABLEX_SORT_ORDER ? options.orderBy : IMMUTABLEX_SORT_ORDER.CREATED_AT,
        sortBy: options.sortBy in SORT_ORDER ? options.sortBy : SORT_ORDER.DESC,
        page: options.page,
      })
    );
  });

  const chainNfts = await Promise.all(results);
  const nfts = new Array().concat.apply([], chainNfts);

  return await nfts;
};

export const InventoryService = {
  getPlayerInventory,
  getInventoryForLocal,
  getInventoryForChain,
};
