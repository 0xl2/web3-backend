import request from 'supertest';
import httpStatus from 'http-status';
import { app } from '@/app';
import { Config } from '@/config/config';

describe('Auth routes', () => {
  describe('GET /v1/docs/swagger', () => {
    test('should return 404 when running in production', async () => {
      Config.env = 'production';
      await request(app).get('/v1/docs/swagger').send().expect(httpStatus.NOT_FOUND);
      Config.env = process.env.NODE_ENV;
    });
  });
});
