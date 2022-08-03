import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import faker from 'faker';
import { User } from '@/models';

const password = 'password1';

const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

export const userOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  gameId: mongoose.Types.ObjectId(),
  imageUrl: 'https://api.lorem.space/image/face?hash=92310',
  role: 'user',
  isEmailVerified: false,
  deletedAt: null,
  isDeleted: false,
};

export const userTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  gameId: mongoose.Types.ObjectId(),
  imageUrl: 'https://api.lorem.space/image/face?hash=92310',
  role: 'user',
  isEmailVerified: false,
  deletedAt: null,
  isDeleted: false,
};

export const admin = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  gameId: mongoose.Types.ObjectId(),
  imageUrl: 'https://api.lorem.space/image/face?hash=92310',
  role: 'admin',
  isEmailVerified: false,
  deletedAt: null,
  isDeleted: false,
};

export const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};
