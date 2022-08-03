import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Player, User } from '@/models';
import { APP_TYPE, Config } from './config';
import { AuthTokenTypes } from './authTokenTypes';

const UserMap = (id) => ({
  [APP_TYPE.XG_CONSOLE]: User.findById(id),
  [APP_TYPE.XG_APP]: Player.findById(id),
});

const jwtOptions = {
  secretOrKey: Config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload: any, done: any) => {
  try {
    if (payload.type !== AuthTokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    const user = await UserMap(payload.sub)[Config.appType];

    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export const Passport = {
  jwtStrategy,
};
