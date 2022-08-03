import passport from 'passport';
import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import { Roles } from '@/config/roles';
import { UserService } from '@/services';
import { oAuth2Client } from '@/config/config';

const verifyCallback =
  (req: any, resolve: any, reject: any, requiredRights: any[]) =>
  async (err: any, user: { role: any; id: any }, info: any) => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights: any[] = Roles.roleRights.get(user.role)!;
      const hasRequiredRights = requiredRights.every((requiredRight: any) => userRights!.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    resolve();
  };

export const auth =
  (...requiredRights: string[]) =>
  async (req: any, res: any, next: any) => {
    if (req.headers.authorization?.split(' ')[0] !== 'Bearer') {
      return next();
    }

    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export const validateAssertion = async (assertion) => {
  const ticket = await oAuth2Client.verifyIdToken({
    idToken: assertion,
  });

  const payload = ticket.getPayload();

  return {
    email: payload.email,
    sub: payload.sub,
  };
};

const verifyGoogleAuth = (requiredRights: string[], user): boolean => {
  if (!requiredRights.length) {
    return false;
  }

  const userRights: any[] = Roles.roleRights.get(user.role)!;
  const hasRequiredRights = requiredRights.every((requiredRight: any) => userRights!.includes(requiredRight));

  if (!hasRequiredRights) {
    return false;
  }

  return true;
};

export const googleAuth =
  (...requiredRights: string[]) =>
  async (req: any, res: any, next: any) => {
    const token = req.headers['authorization'] as string;

    if (!token) {
      return new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    try {
      const info = await validateAssertion(token);
      const email = info.email;

      const user = await UserService.getUserByEmail(email);
      const isVerified = verifyGoogleAuth(requiredRights, user);

      if (!isVerified) {
        return new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      if (!user) {
        return new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
