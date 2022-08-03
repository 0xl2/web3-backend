import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { pick } from '@/utils';
import { checkDocExists } from '@/utils/helpers';
import { UserService } from '@/services/user.service';
import { wrapRequestAsync, xgResponse } from '@/utils/api';

const createUser = wrapRequestAsync(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);

  req.logger?.info('User created successfully', user);
  xgResponse(res, user, httpStatus.CREATED);
});

const getUsers = wrapRequestAsync(async (req: Request, res: Response) => {
  const { options } = req;
  req.logger?.info('Get filters from query', options);
  const filter = pick(req.query, ['name', 'role']);
  req.logger?.info('Get users with filter/s sorting/pagination', [filter, options]);
  const result = await UserService.queryUsers(filter, options);

  req.logger?.info('Users were taken successfully', result);
  xgResponse(
    res,
    {
      results: result.results,
    },
    httpStatus.OK,
    {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalResults: result.totalResults,
      },
    }
  );
});

const getLoggedInUser = wrapRequestAsync(async (req: Request, res: Response) => {
  const user = req.user;

  checkDocExists(user, 'User not found');

  req.logger?.info('Logged In user was taken successfully', user);
  xgResponse(res, user);
});

const getUser = wrapRequestAsync(async (req: Request, res: Response) => {
  req.logger?.info(`Get user by userId - ${req.params.userId}`);
  const user = await UserService.getUserById(req.params.userId);

  checkDocExists(user, `User with id - ${req.params.userId} not found`);

  req.logger?.info('User was taken successfully', user);
  xgResponse(res, user);
});

const updateUser = wrapRequestAsync(async (req: Request, res: Response) => {
  req.logger?.info(`Update user by userId - ${req.params.userId}`);
  const user = await UserService.updateUserById(req.params.userId, req.body);

  req.logger?.info('User updated successfully', user);
  xgResponse(res, user);
});

const deleteUser = wrapRequestAsync(async (req: Request, res: Response) => {
  req.logger?.info(`Delete user by userId - ${req.params.userId}`);
  const user = await UserService.deleteUserById(req.params.userId);

  req.logger?.info('User deleted successfully', user);
  xgResponse(res, {}, httpStatus.NO_CONTENT);
});

export const UserController = {
  createUser,
  getUsers,
  getUser,
  getLoggedInUser,
  updateUser,
  deleteUser,
};
