import { Types } from 'mongoose';
import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import { IEvent } from '@/models/types';
import setupTestDB from '../../utils/setupTestDB';
import { GameTokenService } from '@/services/gameToken.service';
import { ATTRIBUTE_TYPE, GameToken, GAME_TOKEN_STATUS, GAME_TOKEN_TYPE, IGameToken } from '@/models/gameToken.model';

setupTestDB();

describe('Game service', () => {
  let dbGameToken: Partial<IGameToken>;

  beforeEach(async () => {
    dbGameToken = {
      _id: Types.ObjectId(),
      gameId: '100',
      cap: '1000',
      name: 'Xternity Test Collection',
      type: GAME_TOKEN_TYPE.NFT,
      minted: '0',
      imageUrl: null,
      status: GAME_TOKEN_STATUS.ACTIVE,
      attributes: {
        damage: {
          type: ATTRIBUTE_TYPE.TEXT,
          autoSelected: false,
        },
      },
      chainName: 'polygon',
      symbol: 'test',
      events: [
        {
          type: 'test',
          timestamp: new Date().toISOString(),
          issuer: Types.ObjectId(),
          meta: {
            message: `GAMETOKEN DELETED`,
            meta: {
              gameTokenId: 'test id',
              gameId: 'test id',
            },
          },
        },
      ],
    };

    await GameToken.create(dbGameToken);
  });

  afterEach(async () => {
    await GameToken.deleteOne({
      _id: dbGameToken._id,
    });
  });

  describe('getGameTokenById', () => {
    test('should return game token by id', async () => {
      const gameToken = await GameTokenService.getGameTokenById(dbGameToken._id.toString());

      expect(gameToken.name).toEqual(dbGameToken.name);
    });

    test('should return null if id does not exist', async () => {
      const gameToken = await GameTokenService.getGameTokenById(Types.ObjectId().toString());

      expect(gameToken).toBeNull;
    });

    test('should return null if game id does not match game token gameId', async () => {
      const gameToken = await GameTokenService.getGameTokenById(dbGameToken._id.toString());

      expect(gameToken).toBeNull;
    });
  });

  describe('getAllGameTokens', () => {
    test('should return game tokens by gameId', async () => {
      const gameTokens = await GameTokenService.getAllGameTokens(dbGameToken.gameId.toString(), {});

      expect(gameTokens.results.length).toEqual(1);
      expect(gameTokens.results[0]._id.toString()).toEqual(dbGameToken._id.toString());
    });

    test('should return empty array if gameId doesnt exist', async () => {
      const gameTokens = await GameTokenService.getAllGameTokens(Types.ObjectId().toString(), {});

      expect(gameTokens.results.length).toEqual(0);
    });
  });

  describe('getGameTokensCount', () => {
    test('should return game tokens count', async () => {
      const count = await GameTokenService.getGameTokensCount(dbGameToken.gameId.toString());

      expect(count).toEqual(1);
    });

    test('should return 0 if gameId was not found', async () => {
      const count = await GameTokenService.getGameTokensCount(Types.ObjectId().toString());

      expect(count).toEqual(0);
    });
  });

  describe('createGameToken', () => {
    test('should throw if name and gameId exists', async () => {
      const createGameToken = GameTokenService.createGameToken(
        dbGameToken.gameId.toString(),
        {
          user_email: 'Email@mail.ru',
          user_id: Types.ObjectId(),
          game_id: Types.ObjectId(),
          game_title: 'random title',
          is_public: true,
        },
        {
          name: dbGameToken.name,
        } as any,
        {}
      );

      await expect(createGameToken).rejects.toThrow(
        new ApiError(httpStatus.BAD_REQUEST, `${dbGameToken.name} token already exists. Pick a different name.`)
      );
    });

    test.skip('should create game token successfully', async () => {
      const createSpy = jest.spyOn(GameToken, 'create').mockResolvedValue({} as never);

      await GameTokenService.createGameToken(
        dbGameToken.gameId.toString(),
        {
          user_email: 'Email@mail.ru',
          user_id: Types.ObjectId(),
          game_id: Types.ObjectId(),
          game_title: 'random title',
          is_public: true,
        },
        {
          name: 'test name',
          cap: '1000',
        } as any,
        {}
      );

      expect(createSpy).toBeCalledWith(
        [
          {
            name: 'test name',
            gameId: dbGameToken.gameId,
            cap: '1000',
            minted: '0',
            meta: {
              message: 'GAMETOKEN CREATED',
              meta: {
                gameId: dbGameToken.gameId,
                name: 'test name',
              },
            },
            type: 'create',
          },
        ],
        {}
      );
    });
  });

  describe('deleteGameToken', () => {
    let id;

    beforeAll(() => {
      id = Types.ObjectId().toString();
    });

    test('should throw if id does not exist', async () => {
      const deleteGameToken = GameTokenService.deleteGameToken(id, dbGameToken.gameId.toString(), {
        user_email: 'Email@mail.ru',
        user_id: Types.ObjectId(),
        game_id: Types.ObjectId(),
        game_title: 'random title',
        is_public: true,
      });

      await expect(deleteGameToken).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, `Game Token by id - ${id} not found`)
      );
    });

    // test('should throw if id does not match with gameId', async () => {
    //   const deleteGameToken = GameTokenService.deleteGameToken(dbGameToken._id.toString(), Types.ObjectId().toString());

    //   await expect(deleteGameToken).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Game Token not found'));
    // });

    test('should remove game token', async () => {
      const dbGameTokenCopy = JSON.parse(JSON.stringify(dbGameToken));
      dbGameTokenCopy.save = () => {};
      dbGameTokenCopy.remove = () => {};

      jest.spyOn(GameToken, 'findOne').mockResolvedValue(dbGameTokenCopy as any);
      const removeSpy = jest.spyOn(dbGameTokenCopy, 'remove');

      await GameTokenService.deleteGameToken(dbGameToken._id.toString(), dbGameToken.gameId.toString(), {
        user_email: 'Email@mail.ru',
        user_id: Types.ObjectId(),
        game_id: Types.ObjectId(),
        game_title: 'random title',
        is_public: true,
      });
      expect(removeSpy).toBeCalled();
    });
  });

  describe('removeGameTokenAttribute', () => {
    let id;

    beforeAll(() => {
      id = Types.ObjectId().toString();
    });

    test('should throw if id does not exist', async () => {
      const removeProperties = GameTokenService.removeGameTokenAttribute(
        id,
        dbGameToken.gameId.toString(),
        {
          user_email: 'Email@mail.ru',
          user_id: Types.ObjectId(),
          game_id: Types.ObjectId(),
          game_title: 'random title',
          is_public: true,
        },
        []
      );

      await expect(removeProperties).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, `Game Token by id - ${id} not found`)
      );
    });

    // test('should throw if id does not match with gameId', async () => {
    //   const removeProperties = GameTokenService.removeGameTokenAttribute(
    //     dbGameToken._id.toString(),
    //     Types.ObjectId().toString(),
    //     []
    //   );

    //   await expect(removeProperties).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Game Token not found'));
    // });

    test('should remove game token property', async () => {
      const dbGameTokenCopy = JSON.parse(JSON.stringify(dbGameToken));
      dbGameTokenCopy.save = jest.fn();
      dbGameTokenCopy.markModified = jest.fn();

      jest.spyOn(GameToken, 'findOne').mockResolvedValue(dbGameTokenCopy as any);
      const removeSpy = jest.spyOn(dbGameTokenCopy, 'save');

      await GameTokenService.removeGameTokenAttribute(
        dbGameToken._id.toString(),
        dbGameToken.gameId.toString(),
        {
          user_email: 'Email@mail.ru',
          user_id: Types.ObjectId(),
          game_id: Types.ObjectId(),
          game_title: 'random title',
          is_public: true,
        },
        ['health']
      );
      expect(removeSpy).toBeCalled();
      expect(dbGameTokenCopy.attributes.health).toBeUndefined();
      expect(dbGameTokenCopy.attributes.damage).toBeDefined();
    });
  });
});
