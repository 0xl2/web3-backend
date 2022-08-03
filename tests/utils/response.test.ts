import httpStatus from 'http-status';
import httpMocks from 'node-mocks-http';
import { ApiError, xgResponse } from '@/utils/api';

describe('Response creator', () => {
  let mockData;

  beforeAll(() => {
    mockData = {
      games: 'test data model',
    }
  })

  test('should send proper response model for success case', () => {
    const res = httpMocks.createResponse();
    const jsonSpy = jest.spyOn(res, 'json');

    xgResponse(res, mockData, httpStatus.OK);

    expect(jsonSpy).toHaveBeenCalledWith({
      status: 'OK',
      data: mockData,
      meta: {},
      error: '',
    });
  })

  test('should send proper response model for error case', () => {
    const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error');
    const res = httpMocks.createResponse();
    const jsonSpy = jest.spyOn(res, 'json');

    xgResponse(res, {}, httpStatus.BAD_REQUEST, {}, error.message);

    expect(jsonSpy).toHaveBeenCalledWith({
      status: 'ERROR',
      data: {},
      meta: {},
      error: 'Any error',
    });
  })
});
