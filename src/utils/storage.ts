import { Config } from '@/config/config';
import { web3Clients } from '@/services/web3';

const awsUrlMapping = {
  default: {
    getGameTokenUrl: (gameId: string, gameTokenId: string, file: string) =>
      `games/${gameId}/gameTokens/${gameTokenId}/${file}`,
    getGameTokenMetadataBaseUrl: (gameId: string, gameTokenId: string) =>
      `https://${Config.aws.bucket}.s3.amazonaws.com/games/${gameId}/gameTokens/${gameTokenId}`,
  },
  immutable: {
    getGameTokenUrl: (gameId: string, gameTokenId: string, file: string) => `games/${gameId}/immutable/${file}`,
    getGameTokenMetadataBaseUrl: (gameId: string, gameTokenId: string) =>
      `https://${Config.aws.bucket}.s3.amazonaws.com/games/${gameId}/immutable`,
  },
};

export const getGameUrl = (gameId: string, file: string) => `games/${gameId}/props/${file}`;

export const getGameTokenUrl = (client: web3Clients, gameId: string, gameTokenId: string, file: string) =>
  awsUrlMapping[client].getGameTokenUrl(gameId, gameTokenId, file);

export const getGameTokenMetadataBaseUrl = (client: web3Clients, gameId: string, gameTokenId: string) =>
  awsUrlMapping[client].getGameTokenMetadataBaseUrl(gameId, gameTokenId);

export const getGameTempUrl = (gameId: string, name: string) => `games/${gameId}/temp/${name}`;
