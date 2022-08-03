import moment from 'moment';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { AuthToken } from '@/models';
import setupTestDB from '../../utils/setupTestDB';
import { AuthTokenTypes } from '@/config/authTokenTypes';
import { AuthTokenService, UserService } from '@/services';

setupTestDB();

describe('AuthToken service', () => {
  describe('generateToken', () => {
    test('should call jwt.sign with params', () => {
      jest.spyOn(jwt, 'sign').mockReturnValue('token' as any);

      const token = AuthTokenService.generateToken(Types.ObjectId(), moment(), AuthTokenTypes.ACCESS, 'secret');

      expect(token).toEqual('token');
    });
  });

  describe('saveToken', () => {
    test('should call AuthToken.create', async () => {
      const expires = moment();
      const userId = Types.ObjectId();

      const token = {
        token: 'token',
        user: userId,
        expires: expires.toDate(),
        type: AuthTokenTypes.ACCESS,
        blacklisted: false,
      } as any;

      jest.spyOn(AuthToken, 'create').mockReturnValue(token);

      const tokenDoc = await AuthTokenService.saveToken('token', userId, expires, AuthTokenTypes.ACCESS, false);

      expect(tokenDoc).toStrictEqual(token);
    });
  });

  describe('verifyToken', () => {
    test('should return tokenDoc', async () => {
      const expires = moment();

      const token = {
        token: 'token',
        user: Types.ObjectId(),
        expires: expires.toDate(),
        type: AuthTokenTypes.ACCESS,
        blacklisted: false,
      } as any;

      jest.spyOn(jwt, 'verify').mockReturnValue('token' as any);
      jest.spyOn(AuthToken, 'findOne').mockReturnValue(token);

      const tokenDoc = await AuthTokenService.verifyToken('token', AuthTokenTypes.ACCESS);

      expect(tokenDoc).toStrictEqual(token);
    });

    test('should throw if token not found', () => {
      jest.spyOn(jwt, 'verify').mockReturnValue('token' as any);
      jest.spyOn(AuthToken, 'findOne').mockReturnValue(null);

      expect(AuthTokenService.verifyToken('token', AuthTokenTypes.ACCESS)).rejects.toThrow();
    });
  });

  describe('generateAuthTokens', () => {
    test('should return tokens', async () => {
      const user = {
        id: 'test',
      } as any;

      const token = {
        token: 'token',
        type: AuthTokenTypes.ACCESS,
        blacklisted: false,
      } as any;

      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('token' as any);

      const tokens = (await AuthTokenService.generateAuthTokens(user)) as any;

      expect(tokens.access.token).toEqual('token');
      expect(signSpy).toBeCalledTimes(1);
    });
  });

  describe('generateResetPasswordToken', () => {
    test('should throw if user is not found', () => {
      jest.spyOn(UserService, 'getUserByEmail').mockResolvedValue(null);

      expect(AuthTokenService.generateResetPasswordToken).rejects.toThrow();
    });

    test('should return reset password token', async () => {
      jest.spyOn(UserService, 'getUserByEmail').mockResolvedValue({
        id: 'test',
      } as any);

      jest.spyOn(jwt, 'sign').mockReturnValue('token' as any);
      jest.spyOn(AuthToken, 'create').mockReturnValue({ token: 'token' } as any);

      const token = await AuthTokenService.generateResetPasswordToken('test@gmail.com');

      expect(token).toEqual('token');
    });
  });

  describe('generateVerifyEmailToken', () => {
    test('should return verify email token', async () => {
      jest.spyOn(jwt, 'sign').mockReturnValue('token' as any);
      jest.spyOn(AuthToken, 'create').mockReturnValue({ token: 'token' } as any);

      const token = await AuthTokenService.generateVerifyEmailToken({
        id: 'test',
      });

      expect(token).toEqual('token');
    });
  });
});
