import { IAttributeOptions, IGameToken } from '@/models/gameToken.model';

export interface IMarketPlace {
  getAssetUrl: (chain: string, address: string, tokenId: string) => string;
  getAssetMetadata: (
    name: string,
    image: string,
    defaultAttributes: Record<string, IAttributeOptions>,
    attributes: Record<string, string>
  ) => unknown;
}
