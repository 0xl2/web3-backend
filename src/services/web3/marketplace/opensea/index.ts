import { Config } from '@/config/config';
import { IAttributeOptions } from '@/models/gameToken.model';
import { IMarketPlace } from '../types';

export default class OpenSeaMarketPlace implements IMarketPlace {
  public getAssetUrl(chain: string, address: string, tokenId: string): string {
    return `${Config.opensea.url}/assets/${chain}/${address}/${tokenId}`;
  }

  public getAssetMetadata(
    name: string,
    image: string,
    defaultAttributes: Record<string, IAttributeOptions>,
    attributes: Record<string, string>
  ): unknown {
    const selectedAttributes = Object.entries(defaultAttributes)
      .filter(([, options]) => options.autoSelected)
      .map(([name, options]) => ({
        trait_type: name,
        value: options.autoSelectedValue,
      }));

    const mutableAttributes = Object.entries(defaultAttributes)
      .filter(([, options]) => !options.autoSelected)
      .map(([name]) => {
        if (attributes[name] !== undefined && attributes[name] !== null) {
          return {
            trait_type: name,
            value: attributes[name].toString(),
          };
        }
      })
      .filter((q) => q);

    return {
      name,
      image,
      attributes: [...selectedAttributes, ...mutableAttributes],
    };
  }
}
