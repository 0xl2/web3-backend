import httpStatus from 'http-status';
import { SaveOptions, Types } from 'mongoose';
import { ApiError } from '@/utils/api';
import { Logger } from '@/config/logger';
import { IXgContext } from '@/types/global';
import { IMintStatus } from '@/models/types';
import { eventsManager } from './web3/events';
import { getWeb3Info } from '@/utils/web3Helpers';
import { getGameTokenUrl } from '@/utils/storage';
import { BigNumber } from '@ethersproject/bignumber';
import { Config, MINT_FROM_ADDRESS } from '@/config/config';
import { StorageService, MintedNFTSService, PlayerService } from '.';
import { checkDocExists, trackEntityEvent, EVENT_ACTIONS } from '@/utils/helpers';
import { GameToken, IAttributeOptions, IGameToken, GAME_TOKEN_STATUS } from '@/models/gameToken.model';
import { IGame, IPlayer } from '@/models';
import { web3Clients } from './web3';

export type CreateGameTokenDto = Omit<IGameToken, '_id' | 'minted' | 'gameId'>;

export interface MintNft {
  userId: string;
  contractId: string;
  chainName: string;
  address: string;
  amount: number;
  imageUrl: string;
  playerId: string;
  playerEmail: string;
  attributes: Record<string, string>;
}

const getGameTokenById = async (id: string) => GameToken.findById(id);

const getGameTokenByTokenId = async (id: string, gameId: string) =>
  GameToken.findOne({
    shortTokenId: id,
    gameId,
  });

const queryGameTokens = async (gameId: string, query, options) =>
  GameToken.paginate(
    {
      ...query,
      gameId,
    },
    options
  );

const getGameTokensByIds = async (ids: string[], gameId: string) =>
  GameToken.find({
    _id: {
      $in: ids.map((id) => Types.ObjectId(id)),
    },
    gameId,
  });

const getGameTokensByTokenIds = async (ids: string[], gameId: string) =>
  GameToken.find({
    shortTokenId: {
      $in: ids,
    },
    gameId,
  });

const getAllGameTokens = async (gameId: string, options) =>
  GameToken.paginate(
    {
      gameId,
    },
    options
  );

const getGameTokensCount = async (gameId: string) =>
  GameToken.count({
    gameId,
  });

const createGameToken = async (gameId: string, xgContext: IXgContext, createGameToken: CreateGameTokenDto, options: SaveOptions) => {
  Logger.info(`Get GameToken by gameId - ${gameId} name - ${createGameToken.name}`);
  const existingGameToken = await GameToken.findOne({
    gameId,
    name: createGameToken.name.trim(),
  });

  if (existingGameToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${existingGameToken.name} token already exists. Pick a different name.`);
  }

  trackEntityEvent(createGameToken, 'GAMETOKEN', EVENT_ACTIONS.CREATE, xgContext);

  const gameTokenDto: Partial<IGameToken> = {
    ...createGameToken,
    gameId: gameId,
    minted: '0',
  };

  Logger.info('GameToken created successfully', gameTokenDto);
  return await GameToken.create([gameTokenDto], options);
};

const updateGameTokenById = async (id: string, gameId: string, xgContext: IXgContext, updateBody: Partial<IGameToken>) => {
  Logger.info(`Get GameToken by id - ${id} gameId - ${gameId}`);
  let gameToken = await getGameTokenById(id);

  checkDocExists(gameToken, `Game Token by id - ${id} not found`);

  delete updateBody.events;

  trackEntityEvent(gameToken, 'GAMETOKEN', EVENT_ACTIONS.UPDATE, xgContext, { ...updateBody, gameTokenId: id, gameId });

  Logger.info('GameToken updated successfully', gameToken);
  return gameToken.save();
};

const mutateGameToken = async (id: string, gameId: string, xgContext: IXgContext, attributes: Record<string, IAttributeOptions>) => {
  Logger.info(`Get GameToken by id - ${id} gameId- ${gameId}`);
  const existingGameToken = await getGameTokenById(id);

  if (!existingGameToken) {
    throw new ApiError(httpStatus.NOT_FOUND, `Game token with id: ${id} does not exist.`);
  }

  existingGameToken.attributes = {
    ...existingGameToken.attributes,
    ...attributes,
  };

  delete attributes.events;

  const gameToken = trackEntityEvent(existingGameToken, 'GAMETOKEN', EVENT_ACTIONS.MUTATE, xgContext, {
    ...attributes,
    gameTokenId: id,
    gameId,
  });

  existingGameToken.markModified('attributes');
  Logger.info('GameToken modified successfully', gameToken);
  return existingGameToken.save();
};

const deleteGameToken = async (id: string, gameId: string, xgContext: IXgContext) => {
  console.log('id ' + id);
  console.log('gameId ' + gameId);

  Logger.info(`Get GameToken by id - ${id} gameId - ${gameId}`);
  let gameToken = await getGameTokenById(id);

  checkDocExists(gameToken, `Game Token by id - ${id} not found`);

  trackEntityEvent(gameToken, 'GAMETOKEN', EVENT_ACTIONS.DELETE, xgContext, { gameTokenId: id, gameId });
  gameToken.status = GAME_TOKEN_STATUS.DELETED;

  Logger.info('GameToken removed successfully', gameToken);
  await gameToken.save();
  await gameToken.remove();
  return gameToken;
};

const removeGameTokenAttribute = async (id: string, gameId: string, xgContext: IXgContext, attributes: string[]) => {
  Logger.info(`Get GameToken by id - ${id} gameId - ${gameId}`);
  let gameToken = await getGameTokenById(id);

  checkDocExists(gameToken, `Game Token by id - ${id} not found`);

  for (const attr of attributes) {
    delete gameToken.attributes[attr];
  }

  trackEntityEvent(gameToken, 'GAMETOKEN', EVENT_ACTIONS.MODIFY, xgContext, { ...attributes, gameTokenId: id, gameId });

  Logger.info('GameToken attributes removed successfully', gameToken);
  gameToken.markModified('attributes');
  return gameToken.save();
};

const createTransaction = <T = unknown>(cb: (tx) => T) => GameToken.transaction<T>(cb);

const mintToken = async (
  game: IGame,
  gameToken: IGameToken,
  player: IPlayer,
  options: {
    amount: number;
    imageUrl: string;
    attributes: Record<string, string>;
  }
) => {
  if (BigNumber.from(gameToken.minted).add(1).gt(BigNumber.from(gameToken.cap))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cap exceed.');
  }

  const { contract, web3Client } = await getWeb3Info({
    contractId: game.contracts[gameToken.chainName],
    chainName: gameToken.chainName,
  });

  const playerAddress = await PlayerService.getPlayerAddress({
    playerAddress: player.wallets[gameToken.chainName]?.address,
    email: player.email,
    externalId: player.externalPlayerId,
    contract,
    web3Client,
  });

  Logger.info(`Minting chain - ${gameToken.chainName} player address - ${playerAddress} mint details`);

  try {
    await GameTokenService.mint(game, gameToken, {
      userId: player._id.toString(),
      contractId: game.contracts[gameToken.chainName],
      chainName: gameToken.chainName,
      address: playerAddress,
      playerId: player._id.toString(),
      playerEmail: player.email,
      amount: options.amount,
      imageUrl: options.imageUrl,
      attributes: options.attributes,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const mint = async (game, gameToken, options: MintNft) => {
  const { contract, chainInfo, web3Client, web3Market } = await getWeb3Info({
    contractId: options.contractId,
    chainName: options.chainName,
  });

  const transactionRes = await web3Client.mint(
    {
      to_: options.address,
      gameTokenId_: gameToken.shortTokenId,
      amount_: options.amount,
      gameId: game.shortGameId,
    },
    contract
  );

  const mintedNFT = await MintedNFTSService.createMintedNFT({
    tokenId: transactionRes.tokenId,
    issuer: new Types.ObjectId(options.userId),
    gameId: game.shortGameId,
    gameTokenId: gameToken.shortTokenId,
    from: MINT_FROM_ADDRESS,
    to: options.address,
    transactionHash: transactionRes.hash || null,
    marketUrl: null,
    name: gameToken.name,
    status: IMintStatus.PENDING,
    chainName: contract.chainName,
    imageUrl: options.imageUrl,
    playerId: options.playerId,
    contractAddress: contract.address,
    playerEmail: options.playerEmail,
  });

  await eventsManager.on(
    'Transfer',
    contract,
    transactionRes.hash.startsWith('0x') ? transactionRes.hash : null,
    async (fromAddress, toAddress, tokenId, transferData) => {
      let tokenIdDecimal = parseInt(transactionRes.tokenId).toString();
      if (tokenId) {
        tokenIdDecimal = parseInt(tokenId._hex).toString();
      }

      const mintedTotal = BigNumber.from(gameToken.minted).add(BigNumber.from(options.amount));

      gameToken.minted = parseInt(mintedTotal._hex).toString();

      if (gameToken.minted === gameToken.cap) {
        gameToken.status = GAME_TOKEN_STATUS.MINTED;
      }

      await gameToken.save();

      const marketUrl = web3Market.getAssetUrl(chainInfo.chain, contract.address, tokenIdDecimal);

      await MintedNFTSService.updateMintedNftById(mintedNFT.id, {
        tokenId: tokenIdDecimal,
        from: MINT_FROM_ADDRESS,
        to: options.address,
        marketUrl,
        blockNumber: String(transferData?.blockNumber || 0),
        name: `${gameToken.name} #${tokenIdDecimal}`,
        status: IMintStatus.MINTED,
      });

      Logger.info(
        `NFT Updated. ${JSON.stringify({
          tokenId: tokenIdDecimal,
          from: MINT_FROM_ADDRESS,
          to: options.address,
          marketUrl,
          name: `${gameToken.name} #${tokenIdDecimal}`,
          status: IMintStatus.MINTED,
        })}`
      );

      await mintedNFT.save();

      const tokenMetadataUrl = getGameTokenUrl(
        chainInfo.client as web3Clients,
        game.shortGameId.toString(),
        gameToken.shortTokenId.toString(),
        tokenIdDecimal
      );

      const metadataJson = web3Market.getAssetMetadata(
        `${gameToken.name} #${tokenIdDecimal}`,
        options.imageUrl,
        gameToken.attributes,
        options.attributes
      );

      Logger.info(`Upload file with details: ${JSON.stringify(metadataJson)}`);
      await StorageService.uploadFile({
        Bucket: Config.aws.bucket,
        Key: tokenMetadataUrl,
        Body: JSON.stringify(metadataJson),
        ContentType: 'application/json',
      });

      // if (player?.email) {
      // try {
      //   await EmailService.sendEmail(options.playerEmail, 'New NFT', `Congratulations you got new NFT ${marketUrl}`);
      //   Logger.info(`NEW NFT Email sent to ${options.playerEmail}`);
      // } catch (error) {
      //   Logger.error(error);
      // }
      // }
    }
  );
};

export const GameTokenService = {
  getGameTokenById,
  getGameTokenByTokenId,
  getAllGameTokens,
  getGameTokensCount,
  getGameTokensByIds,
  getGameTokensByTokenIds,
  queryGameTokens,
  createGameToken,
  updateGameTokenById,
  mutateGameToken,
  removeGameTokenAttribute,
  deleteGameToken,
  createTransaction,
  mint,
  mintToken,
};
