import httpStatus from 'http-status';
import { ApiError } from '@/utils/api';
import httpMocks from 'node-mocks-http';
import { extractSortAndPagination } from '@/middlewares/sortAndPagination';

describe('Sorting and Pagination middlewares', () => {
  describe('extractSortAndPagination', () => {
    test('should throw an error if req.query.sortBy is not truth type', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, '"sortBy" must be a string');
      const req: any = {
        query: {
          sortBy: 11,
        },
      };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await extractSortAndPagination(req, res, next);

      expect(next).toBeCalledWith(error);
    });

    test('should set the req.options if req.query.sortBy is set', async () => {
      const req: any = {
        query: {
          sortBy: 'title',
        },
      };

      const res = httpMocks.createResponse();
      const next = jest.fn();

      await extractSortAndPagination(req, res, next);

      expect(req.options).toStrictEqual({
        page: 1,
        limit: 10,
        orderBy: 'desc',
        sortBy: 'title',
        cached: true,
      });
      expect(next).toBeCalledWith();
    });

    test('should throw an error if limit is not number', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, '"limit" must be a number');
      const req: any = {
        query: {
          limit: 'test',
        },
      };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await extractSortAndPagination(req, res, next);

      expect(next).toBeCalledWith(error);
    });

    test('should set the req.options if req.query.limit is set', async () => {
      const req: any = {
        query: {
          limit: 1,
        },
      };

      const res = httpMocks.createResponse();
      const next = jest.fn();

      await extractSortAndPagination(req, res, next);

      expect(req.options).toStrictEqual({
        page: 1,
        limit: 1,
        orderBy: 'desc',
        sortBy: 'createdAt',
        cached: true,
      });
      expect(next).toBeCalledWith();
    });

    test('should throw an error if page is not number', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, '"page" must be a number');
      const req: any = {
        query: {
          page: 'test',
        },
      };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await extractSortAndPagination(req, res, next);

      expect(next).toBeCalledWith(error);
    });

    test('should set the req.options if req.query.page is set', async () => {
      const req: any = {
        query: {
          page: 1,
        },
      };

      const res = httpMocks.createResponse();
      const next = jest.fn();

      await extractSortAndPagination(req, res, next);

      expect(req.options).toStrictEqual({
        page: 1,
        limit: 10,
        orderBy: 'desc',
        sortBy: 'createdAt',
        cached: true,
      });
      expect(next).toBeCalledWith();
    });
  });
});
