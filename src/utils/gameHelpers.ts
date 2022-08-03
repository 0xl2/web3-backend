import httpStatus from 'http-status';
import { pick } from '@/utils/index';
import { Logger } from '@/config/logger';
import { GameService } from '@/services';
import { xgResponse } from '@/utils/api';



export const getGamesHelper = async ({ serializeGame, options, query, res }) => {
  Logger.info('Take filters from query params', options);
  const filter = pick(query, ['status']);

  const games = await GameService.queryGames(filter, options);

  Logger.info('Get games complete successfully', games);
  xgResponse(
    res,
    {
      results: games.results.map(serializeGame),
    },
    httpStatus.OK,
    {
      pagination: {
        page: games.page,
        limit: games.limit,
        totalPages: games.totalPages,
        totalResults: games.totalResults,
      },
    }
  );
};

