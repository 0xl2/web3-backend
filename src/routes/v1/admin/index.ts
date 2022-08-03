import { Router } from 'express';
import { AuthRoute } from './auth.route';
import { DocsRoute } from './docs.route';
import { GameRoute } from './game.route';
import { UserRoute } from './user.route';
import { Web3Route } from './web3.route';
import { TokenRoute } from './token.route';
import { EmailRoute } from './email.route';
import { PlayerRoute } from './player.route';
import { ApiKeyRoute } from './apiKey.route';
import { StorageRoute } from './storage.route';
import { GameTokenRoute } from './gameToken.route';
import { MintedNftRoute } from './mintedNft.route';
import { APP_TYPE, Config } from '@/config/config';

const router = Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: AuthRoute.router,
  },
  {
    path: '/users',
    route: UserRoute.router,
  },
  {
    path: '/games',
    route: GameRoute.router,
  },
  {
    path: '/players',
    route: PlayerRoute.router,
  },
  {
    path: '/game-tokens',
    route: GameTokenRoute.router,
  },
  {
    path: '/token',
    route: TokenRoute.router,
  },
  {
    path: '/api-keys',
    route: ApiKeyRoute.router,
  },
  {
    path: '/storage',
    route: StorageRoute.router,
  },
  {
    path: '/nfts',
    route: MintedNftRoute.router,
  },
  {
    path: '/email',
    route: EmailRoute.router,
  },
  {
    path: '/networks',
    route: Web3Route.router,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: DocsRoute.router,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (Config.env === 'development' && Config.appType === APP_TYPE.XG_CONSOLE) {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
