import { GAME_STATUS } from '@/models';
import { Logger } from '@/config/logger';
import { Config } from '@/config/config';
import { getGameUrl } from '@/utils/storage';
import { ApiKeyService } from '@/services/apiKey.service';
import { GAME_TOKEN_STATUS, ISaleOptions, SALE_TYPE } from '@/models/gameToken.model';
import { ContractService, CreateGameTokenDto, GameService, GameTokenService, StorageService, UserService } from '@/services';

export const createGameTokenTransaction = async ({ body, game, tx, userId }): Promise<any> => {
  const gameTokenDto: CreateGameTokenDto = {
    ...body,
    status: GAME_TOKEN_STATUS.INIT,
    cap: body.cap.toString(),
    chainName: body.chainName,
  };

  if (!gameTokenDto.sale || !Object.keys(gameTokenDto.sale).length) {
    const sale: ISaleOptions = {
      type: SALE_TYPE.NONE,
      price: -1,
      currency: 'USD',
    };

    Object.assign(gameTokenDto, { sale });
  } else {
    gameTokenDto.sale.currency = 'USD';
  }

  const [gameTokenCreated] = await GameTokenService.createGameToken(game._id.toString(), userId, gameTokenDto, {
    session: tx,
  });

  gameTokenCreated.status = GAME_TOKEN_STATUS.ACTIVE;
  await gameTokenCreated.save();

  Logger.info(`Create GameToken: ${JSON.stringify(gameTokenCreated)}`);
  return [gameTokenCreated];
};

export const createGametransaction = async ({ tx, gameDto, user }) => {
  const [gameCreated] = await GameService.createGame(gameDto, user._id, {
    session: tx,
  });

  try {
    const gameMetadata = {
      name: gameCreated.title,
      image: gameCreated.imageUrl,
      attributes: [
        {
          trait_type: 'Description',
          value: gameCreated.description,
        },
      ],
    };

    const gameMetadataKey = getGameUrl(gameCreated.shortGameId, 'metadata.json');
    await StorageService.uploadFile({
      Bucket: Config.aws.bucket,
      Key: gameMetadataKey,
      Body: JSON.stringify(gameMetadata),
      ContentType: 'application/json',
    });

    gameCreated.status = GAME_STATUS.ACTIVE;
  } finally {
    await gameCreated.save();

    await UserService.updateUserById(user._id.toString(), {
      gameId: gameCreated.id,
    });

    await ApiKeyService.generateApiKey(
      {
        gameId: gameCreated._id,
        issuer: user._id,
      },
      {
        session: tx,
      }
    );
  }

  return [gameCreated];
};

export const deployGameContractTransaction = async ({ contractDto, contractMetadata, tx }) => {
  const [contractDeployed] = await ContractService.deployGameContract(contractDto, contractMetadata, {
    session: tx,
  });

  await contractDeployed.save();

  return [contractDeployed];
};
