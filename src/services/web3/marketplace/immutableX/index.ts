import { Config } from '@/config/config';
import { IAttributeOptions } from '@/models/gameToken.model';
import { IMarketPlace } from '../types';

export default class ImmutableXMarketPlace implements IMarketPlace {
  public getAssetUrl(chain: string, address: string, tokenId: string): string {
    return `${Config.immutableX.marketUrl}inventory/${address}/${tokenId}`;
  }

  public getAssetMetadata(
    name: string,
    image: string,
    defaultAttributes: Record<string, IAttributeOptions>,
    attributes: Record<string, string>
  ): unknown {
    const metadata = {
      name,
      image,
    };

    Object.entries(defaultAttributes).map(([name, options]) => {
      if (options.autoSelected) {
        metadata[name] = options.autoSelectedValue;
      }
    });

    Object.entries(attributes)
      .map(([name]) => {
        if (attributes[name] !== undefined && attributes[name] !== null) {
          metadata[name] = attributes[name];
        }
      })
      .filter((q) => q);

    return metadata;
  }
}
