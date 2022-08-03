import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { IPlayer } from '@/models';
import { typeOfUser } from '@/types/global';
import { InventoryService } from '@/services';
import { checkDocExists } from '@/utils/helpers';
import { wrapRequestAsync, xgResponse } from '@/utils/api';
import { serializeMintedNft, serializePlayer } from '../admin';

export const serializeNfts = (mintedNFT) => ({
  collection: {
    ...mintedNFT?.collection,
  },
  created_at: mintedNFT?.created_at,
  description: mintedNFT?.description,
  id: mintedNFT?.id,
  image_url: mintedNFT?.image_url,
  metadata: {
    ...mintedNFT?.metadata,
  },
  name: mintedNFT?.name,
  network: mintedNFT?.network,
  status: mintedNFT?.status,
  token_address: mintedNFT?.token_address,
  token_id: mintedNFT?.token_id,
  updated_at: mintedNFT?.updated_at,
  uri: mintedNFT?.uri,
  user: mintedNFT?.user,
});

const getPlayerInfo = wrapRequestAsync(async (req: Request, res: Response) => {
  const player = req.user;

  req.logger?.info(`Get player - ${player} player`);
  checkDocExists(player, 'Player not found');

  xgResponse(res, serializePlayer(player));
});

const getInventoryById = wrapRequestAsync(async (req: Request, res: Response) => {
  const { options, game } = req;
  const player: typeOfUser = req.user;

  checkDocExists(player, 'Player not found');

  req.logger?.info(`Get nfts for player - ${player.name}`);
  const nfts = await InventoryService.getInventoryForLocal(player as IPlayer, game.shortGameId, options);

  req.logger?.info('Inventory was Taken successfully', nfts);
  xgResponse(
    res,
    {
      results: nfts.results.map(serializeMintedNft),
    },
    httpStatus.OK,
    {
      pagination: {
        page: nfts.page,
        limit: nfts.limit,
        totalPages: nfts.totalPages,
        totalResults: nfts.totalResults,
      },
    }
  );
});

const getInventoryForChain = wrapRequestAsync(async (req: Request, res: Response) => {
  const { game, options } = req;
  const player: typeOfUser = req.user;

  const results = [];

  checkDocExists(player, `Player not found`);

  req.logger?.info(`Get nfts for player - ${player.name}`);
  Object.entries(player.wallets).forEach(async ([network, { address }]) => {
    results.push(InventoryService.getInventoryForChain(address, network, game.contracts[network], options));
  });

  const chainNfts = await Promise.all(results);

  xgResponse(res, {
    results: new Array().concat.apply([], chainNfts),
  });
});

const getPlayerInventory = wrapRequestAsync(async (req: Request, res: Response) => {
  const { game, options } = req;
  const player: typeOfUser = req.user;

  checkDocExists(player, `Player not found`);

  req.logger?.info(`Get nfts for player - ${player.name}`);
  const chainNfts = await InventoryService.getPlayerInventory(player as IPlayer, game, options);

  req.logger?.info(`Loaded ${chainNfts.length} assets for player ${player.name}`);
  const serializedNfts = options.cached ? chainNfts.results.map(serializeMintedNft) : chainNfts;

  xgResponse(res, {
    results: serializedNfts,
  });
});

export const PlayerController = {
  getPlayerInfo,
  getInventoryById,
  getPlayerInventory,
  getInventoryForChain,
};
