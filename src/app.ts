import compression from 'compression';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
const xss = require('xss-clean');

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import httpStatus from 'http-status';
import { Config } from './config/config';
import { Morgan } from './config/morgan';
import { Passport } from './config/passport';
import { authLimiter } from './middlewares/rateLimiter';
import { errorConverter, errorHandler } from './middlewares/error';
import { ApiError } from './utils/api';
import { RouterMap } from './routes/v1';

export const app = express();

if (Config.env !== 'test') {
  app.use(Morgan.successHandler);
  app.use(Morgan.errorHandler);
}

// mongoConnector.

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(
  cors({
    exposedHeaders: ['access-control-allow-origin', 'authorization'],
  })
);
app.options('*', cors);

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', Passport.jwtStrategy);

// limit repeated failed requests to auth endpoints
if (Config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.get('/', (req, res) => {
  res.send('v0.1.0');
});

// v1 api routes
app.use('/v1', RouterMap[Config.appType]);

// send back a 404 error for any unknown api request
app.use((req: any, res: any, next: (arg0: any) => void) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);
