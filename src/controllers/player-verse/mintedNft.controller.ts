import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { MintedNFTSService } from '@/services';
import { checkDocExists } from '@/utils/helpers';
import { wrapRequestAsync, xgResponse } from '@/utils/api';

const serializeMintedNft = (mintedNFT) => ({
  id: mintedNFT.id,
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

  checkDocExists(mintedNft, `NFT with Id ${id} not found`);

  xgResponse(res, serializeMintedNft(mintedNft));
});

// GET All
const getAllNfts = wrapRequestAsync(async (req: Request, res: Response) => {
  const { options } = req;

  req.logger?.info(`Get all available NFTs from local with filters - ${options}`);
  const mintedNfts = await MintedNFTSService.getAllMintedNFTS({}, options);

  xgResponse(
    res,
    {
      results: mintedNfts.results.map(serializeMintedNft),
    },
    httpStatus.OK,
    {
      pagination: {
        page: mintedNfts.page,
        limit: mintedNfts.limit,
        totalPages: mintedNfts.totalPages,
        totalResults: mintedNfts.totalResults,
      },
    }
  );
});

export const MintedNftController = {
  getNftById,
  getAllNfts,
};
