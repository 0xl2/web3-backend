import { Types } from 'mongoose';

export const stringToObjectId = (id: string) => Types.ObjectId(id);
