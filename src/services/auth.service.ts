import axios from 'axios';
import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import { Logger } from '@/config/logger';
import { UserService } from './user.service';
import { checkDocExists } from '@/utils/helpers';
import { AuthToken } from '@/models/authToken.model';
import { createCaptchaUrl } from '@/utils/urlHelpers';
import { AuthTokenService } from './authToken.service';
import { AuthTokenTypes  } from '@/config/authTokenTypes';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email: string, password: string): Promise<any> => {
  const user = await UserService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  Logger.info(`User - ${user._id}/${user.role} was found`);
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken: string): Promise<any> => {
  return await AuthToken.findOneAndDelete(
    { token: refreshToken, type: AuthTokenTypes.REFRESH, blacklisted: false },
    {},
    (err, docs) => {
      if (err) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
      } else {
        Logger.info('refreshToken removed successfully', docs);
      }
    }
  );
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken: string): Promise<object> => {
  try {
    const refreshTokenDoc = await AuthTokenService.verifyToken(refreshToken, AuthTokenTypes.REFRESH);
    const user = await UserService.getUserById(refreshTokenDoc.user);

    checkDocExists(user, `User with id - ${refreshTokenDoc.user} not found`);

    Logger.info('Trying remove refreshToken', [refreshTokenDoc, user]);
    await refreshTokenDoc.remove();
    return AuthTokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken: string, newPassword: string): Promise<any> => {
  try {
    const resetPasswordTokenDoc = await AuthTokenService.verifyToken(resetPasswordToken, AuthTokenTypes.RESET_PASSWORD);
    Logger.info(`Get User by id ${resetPasswordTokenDoc.user}`);
    const user = await UserService.getUserById(resetPasswordTokenDoc.user);

    checkDocExists(user, `User with id - ${resetPasswordTokenDoc.user} not found`);

    Logger.info(`Update User by id ${user.id}`);
    await UserService.updateUserById(user.id, { password: newPassword });
    await AuthToken.deleteMany({ user: user.id, type: AuthTokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken: string): Promise<any> => {
  try {
    Logger.info(`Verify token - ${verifyEmailToken}`);
    const verifyEmailTokenDoc = await AuthTokenService.verifyToken(verifyEmailToken, AuthTokenTypes.VERIFY_EMAIL);
    Logger.info(`Get User by id - ${verifyEmailTokenDoc.user}`);
    const user = await UserService.getUserById(verifyEmailTokenDoc.user);

    checkDocExists(user, `User with id - ${verifyEmailTokenDoc.user} not found`);

    await AuthToken.deleteMany({ user: user.id, type: AuthTokenTypes.VERIFY_EMAIL });
    Logger.info(`Update User by id - ${user.id}`);
    await UserService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

const verifyCaptcha = async (gCaptchaToken: string): Promise<void> => {
  const url = createCaptchaUrl(gCaptchaToken);

  const { data }: any = await axios.post(url);
  const isVerified = data.success;

  if (!isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Google Captcha verification failed');
  }
};

export const AuthService = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  verifyCaptcha,
};
