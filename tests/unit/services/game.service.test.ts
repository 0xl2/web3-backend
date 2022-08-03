import faker from 'faker';
import { Types } from 'mongoose';
import { ROLES } from '@/config/roles';
import { GameService } from '@/services';
import setupTestDB from '../../utils/setupTestDB';
import { Game, IGame, IUser, User } from '@/models';
import { ApiKeyService } from '@/services/apiKey.service';

setupTestDB();

const initGame = () => ({
  _id: Types.ObjectId(),
  title: faker.name.findName(),
  apiKey: {
    value: faker.name.findName(),
    created: faker.date.between(),
    issuer: faker.name.findName(),
  },
  contracts: {
    mumbai: {
      contract: faker.finance.ethereumAddress(),
      treasury: faker.finance.ethereumAddress(),
    },
  },
});

describe('Game service', () => {
  let dbGame: Partial<IGame>;
  let dbUser: Partial<IUser>;

  beforeEach(async () => {
    dbGame = {
      _id: Types.ObjectId(),
      title: faker.name.findName(),
    };

    await Game.create(dbGame);

    dbUser = {
      _id: Types.ObjectId(),
      gameId: dbGame._id.toString(),
      email: 'aa@gmail.com',
      password: 'password1',
      name: 'test',
      role: ROLES.ADMIN,
    };

    await User.create(dbUser);
  });

  afterEach(async () => {
    await Game.deleteOne({
      _id: dbGame._id,
    });
  });

  describe('getByApiKey', () => {
    test('should return game by api key', async () => {
      jest.spyOn(ApiKeyService, 'getApiKeyByValue').mockResolvedValue({
        status: 'ACTIVE',
        gameId: dbGame._id,
      } as any);

      const game = await GameService.getByApiKey('test');

      expect(game.title).toEqual(dbGame.title);
    });

    test('should return null if key does not exist', async () => {
      const game = await GameService.getByApiKey('');

      expect(game).toBeNull();
    });
  });

  describe('getGameById', () => {
    test('should return game by id', async () => {
      const game = await GameService.getGameById(dbGame._id.toString());

      expect(game.title).toEqual(dbGame.title);
    });

    test('should return null if id does not exist', async () => {
      const game = await GameService.getGameById(Types.ObjectId().toString());

      expect(game).toBeNull();
    });
  });

  describe('queryGames', () => {
    test('should return game by title', async () => {
      const games = await GameService.queryGames(
        {
          title: dbGame.title,
        },
        {}
      );

      expect(games.page).toEqual(1);
      expect(games.limit).toEqual(10);
      expect(games.results[0].title).toEqual(dbGame.title);
    });

    test('should return null if query does not exist', async () => {
      const games = await GameService.queryGames(
        {
          title: 'test',
        },
        {}
      );

      expect(games.page).toEqual(1);
      expect(games.limit).toEqual(10);
      expect(games.results).toEqual([]);
    });
  });

  describe('createGame', () => {
    test('should create game', async () => {
      const game = initGame();

      await Game.create(game);

      const createdGame = await GameService.getGameById(game._id.toString());

      expect(createdGame).not.toBeNull();
    });

    test('should fail the validation', async () => {
      const game = {
        _id: Types.ObjectId(),
        apiKey: {
          value: faker.name.findName(),
          created: faker.date.between(),
          issuer: faker.name.findName(),
        },
      };

      await expect(Game.create(game)).rejects.toThrow();
    });
  });

  describe('updateGame', () => {
    test.skip('should update game', async () => {
      const updatedGame = await GameService.updateGameById(
        dbGame._id.toString(),
        {
          user_email: dbUser.email,
          user_id: dbUser._id,
          game_id: Types.ObjectId(),
          game_title: 'random title',
          is_public: true,
        },
        {
          title: 'updated title',
        }
      );

      expect(updatedGame.title).toEqual('updated title');
    });
  });

  describe('deleteGame', () => {
    test('should delete game', async () => {
      const game = initGame();

      await Game.create(game);

      const createdGame = await GameService.getGameById(game._id.toString());

      expect(createdGame).not.toBeNull();

      await GameService.deleteGameById(game._id.toString(), {
        user_email: dbUser.email,
        user_id: dbUser._id,
        game_id: Types.ObjectId(),
        game_title: 'random title',
        is_public: true,
      });
      const gameById = await GameService.getGameById(game._id.toString());

      expect(gameById).toBeNull();
    });
  });
});
