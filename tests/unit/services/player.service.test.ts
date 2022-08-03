import faker from 'faker';
import { Types } from 'mongoose';
import setupTestDB from '../../utils/setupTestDB';
import { Player, IPlayer, PLAYER_STATUS } from '@/models';
import { PlayerService } from '@/services';

setupTestDB();

const initPlayer = () => ({
  _id: Types.ObjectId(),
  externalPlayerId: Types.ObjectId().toString(),
  gameId: faker.name.findName(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  status: PLAYER_STATUS.ACTIVE,
  wallets: {
    matic: {
      address: faker.finance.ethereumAddress(),
    },
  },
});

describe('Player service', () => {
  let dbPlayer: Partial<IPlayer>;

  beforeEach(async () => {
    dbPlayer = {
      _id: Types.ObjectId(),
      externalPlayerId: Types.ObjectId().toString(),
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      gameId: Types.ObjectId().toString(),
      status: PLAYER_STATUS.ACTIVE,
      wallets: {
        polygon: {
          address: '0xDF8652B3d47000f2E90597049dF24944E9398E5a',
          isExternal: false,
        },
      },
    };

    await Player.create(dbPlayer);
  });

  afterEach(async () => {
    await Player.deleteOne({
      _id: dbPlayer._id,
    });
  });

  describe('getPlayerByEmail', () => {
    test('should return player by api key', async () => {
      const player = await PlayerService.getPlayerByEmail(dbPlayer.email);

      expect(player.email).toEqual(dbPlayer.email);
    });

    test('should return null if key does not exist', async () => {
      const player = await PlayerService.getPlayerByEmail('');

      expect(player).toBeNull();
    });
  });

  describe('getPlayerById', () => {
    test('should return player by id', async () => {
      const player = await PlayerService.getPlayerById(dbPlayer._id.toString());

      expect(player.name).toEqual(dbPlayer.name);
    });

    test('should return null if id does not exist', async () => {
      const player = await PlayerService.getPlayerById(Types.ObjectId().toString());

      expect(player).toBeNull();
    });
  });

  describe('queryPlayers', () => {
    test('should return player by title', async () => {
      const players = await PlayerService.queryPlayers(
        {
          name: dbPlayer.name,
        },
        {}
      );

      expect(players.page).toEqual(1);
      expect(players.limit).toEqual(10);
      expect(players.results[0].name).toEqual(dbPlayer.name);
    });

    test('should return null if query does not exist', async () => {
      const players = await PlayerService.queryPlayers(
        {
          title: 'test',
        },
        {}
      );

      expect(players.page).toEqual(1);
      expect(players.limit).toEqual(10);
      expect(players.results).toEqual([]);
    });
  });

  describe('createPlayer', () => {
    test('should create player', async () => {
      const player = initPlayer();

      await Player.create(player);

      const createdPlayer = await PlayerService.getPlayerById(player._id.toString());

      expect(createdPlayer).not.toBeNull();
    });

    test('should fail the validation', async () => {
      const player = {
        _id: Types.ObjectId(),
        externalPlayerId: Types.ObjectId().toString(),
        game: faker.name.findName(),
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
      };

      await expect(Player.create(player)).rejects.toThrow();
    });
  });

  describe('updatePlayer', () => {
    test.skip('should update player', async () => {
      const updatedPlayer = await PlayerService.updatePlayerById(
        dbPlayer._id.toString(),
        {
          name: 'updated name',
        },
        {
          user_email: 'Email@mail.ru',
          user_id: Types.ObjectId(),
          game_id: Types.ObjectId(),
          game_title: 'random title',
          is_public: true,
        }
      );

      expect(updatedPlayer.name).toEqual('updated name');
    });

    test.skip('should fail the validation', async () => {
      await expect(
        PlayerService.updatePlayerById(
          dbPlayer._id.toString(),
          {
            wallets: null,
          },
          {
            user_email: 'Email@mail.ru',
            user_id: Types.ObjectId(),
            game_id: Types.ObjectId(),
            game_title: 'random title',
            is_public: true,
          }
        )
      ).rejects.toThrow();
    });
  });

  describe('deletePlayer', () => {
    test('should delete player', async () => {
      const player = initPlayer();

      await Player.create(player);

      const createdPlayer = await PlayerService.getPlayerById(player._id.toString());

      expect(createdPlayer).not.toBeNull();

      await PlayerService.deletePlayerById(player._id.toString(), {
        user_email: 'Email@mail.ru',
        user_id: Types.ObjectId(),
        game_id: Types.ObjectId(),
        game_title: 'random title',
        is_public: true,
      });
      const playerById = await PlayerService.getPlayerById(player._id.toString());

      expect(playerById).toBeNull();
    });
  });
});
