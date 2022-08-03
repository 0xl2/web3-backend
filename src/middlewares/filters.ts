// import Joi from 'joi';
// import httpStatus from 'http-status';
// import { Request, Response, NextFunction } from 'express';
// import { ApiError } from '@/utils/api';

// export const genericFiltersSchema = (entity, keys) => {
//   const path = keys;

//   if (Array.isArray(entity)) {
//     for (const key in entity) {
//       genericFiltersSchema(entity[key], path);
//     }
//   } else {
//     for (const prop in entity) {
//       if (['number'].includes(entity[prop]?.type)) {
//         path.push(prop);
//       }
//       if (typeof entity[prop] == 'object' || Array.isArray(entity[prop])) {
//         genericFiltersSchema(entity[prop], path);
//       }
//     }
//   }

//   return Joi.object()
//     .pattern(Joi.string().valid(...path), Joi.any())
//     .default({});
// };

// export const keyExists = (obj, key, keys = [], visited = new Set()) => {
//   if (visited.has(obj)) return;
//   visited.add(obj);
//   keys.push(...Object.keys(obj));

//   for (const val of Object.values(obj)) {
//     if (val && typeof val === 'object') {
//       keyExists(val, key, keys, visited);
//     }
//   }

//   return { exists: keys.includes(key) };
// };

// const getKeyPath = (obj, target) => {
//   if (!obj || typeof obj !== 'object') return;

//   if (target in obj) return [target];

//   for (const key in obj) {
//     const temp = getKeyPath(obj[key], target);

//     if (temp) return [key, ...temp];
//   }
// };

// export const extractFilters = (entity) => async (req: Request, res: Response, next: NextFunction) => {
//   let keyPath;
//   const models = await entity.find({});
//   const modelSchema = models[models.length - 1]._doc;
//   const filters: any = {};
//   Object.entries(req.query)
//     .map(([key, value]: [string, string]) => {
//       let objectKey;
//       if (key.indexOf(',') !== -1) {
//         const nestedFieldWay = key.split(',');
//         objectKey = nestedFieldWay.join('.');
//       } else {
//         objectKey = key;
//       }

//       const { exists } = keyExists(modelSchema, objectKey, []);

//       if (exists) {
//         keyPath = getKeyPath(modelSchema, objectKey)?.join('.').replace(/\s/g, '');
//         Object.assign(filters, { [keyPath || objectKey]: value });
//       }
//     })
//     .filter((filter) => filter);

//   const { value, error } = Joi.compile(genericFiltersSchema(modelSchema, []))
//     .prefs({ errors: { label: 'key' }, abortEarly: false })
//     .validate(filters);

//   if (error) {
//     const errorMessage = error.details.map((details) => details.message).join(', ');
//     return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
//   }

//   const filtersQuery = {};
//   Object.entries(value).map(([key, value]: [string, string]) => {
//     const filterParts = value.split(/\[(.+?)\]\[(.+?)]/).filter((piece) => piece.length);

//     for (let index = 0; index < filterParts.length; index + 2) {
//       const value = filterParts[index + 1];
//       return Object.assign(filtersQuery, { [keyPath]: { [filterParts[index]]: value } });
//     }
//   });

//   req.filters = filtersQuery;

//   next();
// };
