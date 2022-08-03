import { APP_TYPE } from '@/config/config';
import adminRoutes from './admin';
import playerVerseRoutes from './player-verse';

export const RouterMap = {
  [APP_TYPE.XG_CONSOLE]: adminRoutes,
  [APP_TYPE.XG_APP]: playerVerseRoutes,
};
