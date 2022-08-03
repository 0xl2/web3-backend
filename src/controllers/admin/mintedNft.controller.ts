import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { pick } from '@/utils';
import { MintedNFTSService } from '@/services';
import { checkDocExists } from '@/utils/helpers';
import { wrapRequestAsync, xgResponse } from '@/utils/api';

export const serializeMintedNft = (mintedNFT) => ({
  id: mintedNFT.id,
  name: mintedNFT.name,
  userId: mintedNFT.issuer,
  gameId: mintedNFT.gameId,
  tokenId: mintedNFT.tokenId,
  from: mintedNFT.from,
  to: mintedNFT.to,
  createdAt: mintedNFT.createdAt,
  gameTokenId: mintedNFT.gameTokenId,
  transactionHash: mintedNFT.transactionHash,
  marketUrl: mintedNFT.marketUrl,
  chainName: mintedNFT.chainName,
  status: mintedNFT.status,
  imageUrl: mintedNFT.imageUrl,
});

// GET
const getNftById = wrapRequestAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  req.logger?.info(`Fetching minted NFT by Id ${id}`);
  const mintedNft = await MintedNFTSService.getMintedNFTById(id);

  checkDocExists(mintedNft, ` NFT with Id ${id} not found`);

  xgResponse(res, serializeMintedNft(mintedNft));
});

// GET All NFT's
const getAllNfts = wrapRequestAsync(async (req: Request, res: Response) => {
  const { options, game } = req;
  const filter = pick(req.query, ['playerId']) || {};
  Object.assign(filter, { gameId: game.shortGameId.toString() });
  
  req.logger?.info(`Fetching minted NFT's by gameId ${game.shortGameId}`);
  const mintedNfts = await MintedNFTSService.getAllMintedNFTS(filter, options);

  xgResponse(res, { results: mintedNfts.results.map(serializeMintedNft) }, httpStatus.OK, {
    pagination: {
      page: mintedNfts.page,
      limit: mintedNfts.limit,
      totalPages: mintedNfts.totalPages,
      totalResults: mintedNfts.totalResults,
    },
  });
});

export const MintedNftController = {
  getNftById,
  getAllNfts,
};
