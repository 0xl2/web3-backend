import { PLAYER_STATUS } from '@/models';
import setupTestDB from '../../utils/setupTestDB';
import { InventoryService } from '@/services';

setupTestDB();

describe('Inventory service', () => {
  describe('getInventoryForLocal', () => {
    test('should get an inventory', async () => {
      const game = {
        _id: '629649dd9285970e4f3f7e51',
        events: [
          {
            timestamp: '2022-05-31T17:01:15.110Z',
            type: 'create',
            meta: {
              message: 'GAME CREATED',
              meta: {
                title: 'Edik Testst',
              },
            },
          },
        ],
        isDeleted: false,
        deletedAt: null,
        title: 'Edik Testst',
        description: 'in commodo dolor sin',
        imageUrl: 'https://assets.thehansindia.com/h-upload/feeds/2019/05/11/173704-zakat.jpg?width=500&height=300',
        mediaUrl: 'https://assets.thehansindia.com/h-upload/feeds/2019/05/11/173704-zakat.jpg?width=500&height=300',
        status: 'ACTIVE',
        createdAt: '2022-05-31T17:01:17.064Z',
        updatedAt: '2022-05-31T17:01:19.040Z',
        contracts: {
          mumbai: '62964e56d1aa30dd4d39746b',
        },
        shortGameId: '4',
      };

      const player = {
        _id: '629655261d327f14c229128f',
        isEmailVerified: false,
        events: [
          {
            timestamp: '2022-05-31T17:49:26.085Z',
            type: 'create',
            meta: {
              message: 'PLAYER CREATED',
            },
          },
        ],
        externalPlayerId: 'User121212Id',
        gameId: '629649dd9285970e4f3f7e51',
        name: 'fake name',
        email: 'edik.baghdasaryan@milies.net',
        wallets: {
          mumbai: {
            address: '0x73FcBd9322F3c837f72A93861Cb69F0342667F1c',
          },
        },
        status: PLAYER_STATUS.ACTIVE,
      };

      jest.spyOn(InventoryService, 'getInventoryForLocal').mockResolvedValue({
        results: [player],
      });

      const inventory = await InventoryService.getInventoryForLocal(player as any, game.shortGameId, {});

      expect(inventory.results[0]).toEqual(player);
    });

    test.skip('should throw if game is null', async () => {
      expect(
        InventoryService.getInventoryForLocal(
          {
            wallets: {
              polygon: {
                address: '0x222',
              }, //  { _id: ObjectId('6296563813b79f160aa91c94')}
            },
          } as any,
          '999',
          null
        )
      ).rejects.toThrow();
    });

    test('should return empty array if player is null', async () => {
      const inventory = await InventoryService.getInventoryForLocal(
        null,
        {
          chain: {
            name: 'polygon',
          },
          address: {
            contract: '0x111',
          },
        } as any,
        '099'
      );

      expect(inventory).toEqual([]);
    });
  });
});
