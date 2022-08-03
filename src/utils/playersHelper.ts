import httpStatus from 'http-status';
import { xgResponse } from '@/utils/api';
import { serializePlayer } from '@/controllers/admin';

export const playersResponse = ({ res, players }) => {
  xgResponse(
    res,
    {
      results: players.results.map(serializePlayer),
    },
    httpStatus.OK,
    {
      pagination: {
        page: players.page,
        limit: players.limit,
        totalPages: players.totalPages,
        totalResults: players.totalResults,
      },
    }
  );
};
