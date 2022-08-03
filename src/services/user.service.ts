import httpStatus from 'http-status';
import { IUser, User } from '@/models';
import { ApiError } from '@/utils/api';
import { Logger } from '@/config/logger';
import { checkDocExists } from '@/utils/helpers';
import { IPaginatedResults } from '@/models/types';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody: IUser) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  Logger.info(`Creating user by name - ${userBody.name} and role - ${userBody.role}`);
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter: Record<string, any>, options: Record<string, any>): Promise<IPaginatedResults<IUser>> =>
  await User.paginate(filter, options);

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id: string) => User.findById(id);

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email: string) => User.findOne({ email });

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId: string, updateBody: Partial<IUser>): Promise<IUser> => {
  Logger.info(`Get user by id ${userId}`);
  const user = await getUserById(userId);

  checkDocExists(user, `User by id - ${userId} not found`);

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  Logger.info(`update user ${user.name} with details`, updateBody);
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId: string): Promise<any> => {
  Logger.info(`Get user by id ${userId}`);
  const user = await getUserById(userId);

  checkDocExists(user, `User by id - ${userId} not found`);

  await user.remove();

  return user;
};

export const UserService = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
