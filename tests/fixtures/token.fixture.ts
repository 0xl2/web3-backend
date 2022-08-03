import moment from 'moment';
import { Config } from '@/config/config';
import { userOne, admin } from './user.fixture';
import { AuthTokenTypes } from '@/config/authTokenTypes';
import { AuthTokenService } from '@/services/authToken.service';

export const accessTokenExpires = moment().add(Config.jwt.accessExpirationMinutes, 'minutes');
export const userOneAccessToken = AuthTokenService.generateToken(userOne._id, accessTokenExpires, AuthTokenTypes.ACCESS);
export const adminAccessToken = AuthTokenService.generateToken(admin._id, accessTokenExpires, AuthTokenTypes.ACCESS);
