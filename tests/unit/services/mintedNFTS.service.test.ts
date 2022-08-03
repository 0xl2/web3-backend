// @ts-ignore
import { Types } from 'mongoose';
import { MintedNFTS } from '@/models';
import { IMintStatus } from '@/models/types';
import { MintedNFTSService } from '@/services';
import setupTestDB from '../../utils/setupTestDB';

setupTestDB();

describe('mintedNFTS service', () => {
  describe('createTokenMapping', () => {
    test('should create token mapping', async () => {
      const tokenMapping = {
        _id: Types.ObjectId(),
        issuer: Types.ObjectId(),
        gameId: '1',
        name: 'test',
        tokenId: '1',
        gameTokenId: '1',
        from: '0x00',
        to: '0x01',
        openseaUrl: 'https://testnets.opensea.io/assets/polygon/0xaA787F98FDF99d040208980E8384419dA1496c46/2',
        transactionHash: '0x39af55979f5b690fdce14eb23f91dfb0357cb1a27f387656e197636e597b5b7c',
        chainName: 'polygon',
        status: IMintStatus.MINTED,
        playerId: '628b838ad8e0437dea794e1e',
        playerEmail: 'vahe@example.com',
        blockNumber: '26957759',
        contractAddress: '0x3180137717C7467706672041937465ea440c0aeb',
      };

      await MintedNFTSService.createMintedNFT(tokenMapping);

      const createdTokenMapping = await MintedNFTS.findById(tokenMapping);

      expect(createdTokenMapping).not.toBeNull();
    });
  });
});
