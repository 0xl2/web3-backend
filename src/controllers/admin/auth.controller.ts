import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { Config } from '@/config/config';
import { checkDocExists } from '@/utils/helpers';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { AuthTokenService, PlayerService } from '@/services';
import { ApiError, wrapRequestAsync, xgResponse } from '@/utils/api';
import { EmailService, SUBJECT_TYPES } from '@/services/email.service';

const impersonatePlayer = wrapRequestAsync(async (req: Request, res: Response) => {
  const externalPlayerId = String(req.query.externalPlayerId);
  req.logger?.info(`Creating login url for externalId: ${externalPlayerId}`);
  const player = await PlayerService.getPlayerByExternalId(req.user.gameId, externalPlayerId);

  checkDocExists(player, `Player with externalId ${externalPlayerId} not found`, httpStatus.BAD_REQUEST);

  await PlayerService.generatePlayerExternalToken(player);

  const loginUrl = `${Config.xgAppUrl}/login?external=${player.externalLoginToken}`;

  xgResponse(res, { url: loginUrl });
});

const register = wrapRequestAsync(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);
  const tokens = await AuthTokenService.generateAuthTokens(user);

  req.logger?.info('Registration complete successfully', user._id);
  xgResponse(res, { user, tokens }, httpStatus.CREATED);
});

const login = wrapRequestAsync(async (req: Request, res: Response) => {
  throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate.');

  const { email, password, gCaptchaToken } = req.body;

  gCaptchaToken && (await AuthService.verifyCaptcha(gCaptchaToken));
  const user = await AuthService.loginUserWithEmailAndPassword(email, password);
  const tokens = await AuthTokenService.generateAuthTokens(user);

  req.logger?.info(`User ${user.id} logged in`);
  xgResponse(res, { user, tokens });
});

const logout = wrapRequestAsync(async (req: Request, res: Response) => {
  await AuthService.logout(req.body.refreshToken);

  xgResponse(res, {}, httpStatus.NO_CONTENT);
});

const refreshTokens = wrapRequestAsync(async (req: Request, res: Response) => {
  const tokens = await AuthService.refreshAuth(req.body.refreshToken);

  req.logger?.info('ApiKey successfully revoked', tokens);
  xgResponse(res, { tokens }, httpStatus.OK);
});

const forgotPassword = wrapRequestAsync(async (req: Request, res: Response) => {
  const resetPasswordToken = await AuthTokenService.generateResetPasswordToken(req.body.email);
  await EmailService.sendEmail(req.body.email, SUBJECT_TYPES.RESET_PASSWORD, '', resetPasswordToken);

  req.logger?.info(`Email was sent to ${req.body.email} successfully`);
  xgResponse(res, {}, httpStatus.NO_CONTENT);
});

const resetPassword = wrapRequestAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.query.token as string, req.body.password);

  req.logger?.info(`Email was sent to ${req.body.email} successfully`);
  xgResponse(res, {}, httpStatus.NO_CONTENT);
});

const sendVerificationEmail = wrapRequestAsync(async (req: Request, res: Response) => {
  const verifyEmailToken = await AuthTokenService.generateVerifyEmailToken(req.user);
  await EmailService.sendEmail(req.user!.email, SUBJECT_TYPES.EMAIL_VERIFICATION, '', verifyEmailToken);

  req.logger?.info(`Email was sent to ${req.user!.email} successfully`);
  xgResponse(res, {}, httpStatus.NO_CONTENT);
});

const verifyEmail = wrapRequestAsync(async (req: Request, res: Response) => {
  await AuthService.verifyEmail(req.query.token as string);

  xgResponse(res, {}, httpStatus.NO_CONTENT);
});

export const AuthController = {
  impersonatePlayer,
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
