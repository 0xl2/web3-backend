import { Router } from 'express';
import { GameRoute } from './game.route';
import { AuthRoute } from './auth.route';
import { PlayerRoute } from './player.route';
import { MintedNftRoute } from './mintedNft.route';
import { GameTokenRoute } from './gameToken.route';
import { PaymentRoute } from './payment.route';

const router = Router();

const publicRoutes = [
  {
    path: '/games',
    route: GameRoute.router,
  },
  {
    path: '/nfts',
    route: MintedNftRoute.router,
  },
  {
    path: '/game-tokens',
    route: GameTokenRoute.router,
  },
  {
    path: '/auth',
    route: AuthRoute.router,
  },
  {
    path: '/players',
    route: PlayerRoute.router,
  },
  {
    path: '/payments',
    route: PaymentRoute.router,
  },
];

publicRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
