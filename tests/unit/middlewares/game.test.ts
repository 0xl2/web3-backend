import crypto from 'crypto';
import httpStatus from 'http-status';
import httpMocks from 'node-mocks-http';
import { ApiError } from '@/utils/api';
import { GameService } from '@/services';
import { useGame } from '@/middlewares/game';

describe('Game middlewares', () => {
  describe('useGameId', () => {
    test('should throw an error if req.user.gameId is undefined', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'User has no game.');
      const req: any = {
        user: {}
      };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await useGame(req, res, next);

      expect(next).toBeCalledWith(error);
    });

    test('should throw an error if game does not exist', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Invalid Game id.');
      const req: any = {
        user: {
          gameId: 'test',
        }
      };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      jest.spyOn(GameService, 'getGameById').mockResolvedValue(null);

      await useGame(req, res, next);

      expect(next).toBeCalledWith(error);
    });

    test('should set the req.game if req.apiKey is set', async () => {
      const req: any = {
        user: {
          gameId: 'test',
        }
      }; const res = httpMocks.createResponse();
      const next = jest.fn();

      jest.spyOn(GameService, 'getGameById').mockResolvedValue({
        id: 'test',
      } as any);

      await useGame(req, res, next);

      expect(req.game).toStrictEqual({
        id: 'test',
      });
      expect(next).toBeCalledWith();
    });
  });
});
