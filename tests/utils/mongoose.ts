import { model, Schema } from 'mongoose';

export const createModel = (schema: Schema) => model((Math.random() * 100000).toString(), schema);
