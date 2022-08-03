import winston from 'winston';
import { Config } from './config';

const enumerateErrorFormat = winston.format((info: any) => {
  if (Config.env === 'development' && info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

export const Logger = winston.createLogger({
  level: Config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf((info) => `${JSON.stringify({ timestamp: info.timestamp, level: info.level, message: info.message })}`)
  ),
  transports: [new winston.transports.Console()],
  exceptionHandlers: [new winston.transports.File({ filename: 'exceptions.log' })],
  rejectionHandlers: [new winston.transports.File({ filename: 'rejections.log' })],
});
