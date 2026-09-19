import { describe, it, expect, jest } from '@jest/globals';
import { cacheMiddleware, invalidateUserCache } from '../src/middleware/cacheMiddleware.js';
import redisService from '../src/config/redis.js';

describe('Redis Cache Middleware & Invalidation', () => {
  it('should pass through when Redis is not ready', async () => {
    const middleware = cacheMiddleware('test_prefix', 60);
    const req = {
      method: 'GET',
      user: { id: 'user123' },
      query: { page: '1' },
    };
    const res = {
      setHeader: jest.fn(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should serve cached data on cache HIT when Redis is ready', async () => {
    const mockData = { success: true, data: [{ id: 1, name: 'Groceries' }] };
    const getAsyncSpy = jest.spyOn(redisService, 'getAsync').mockResolvedValue(JSON.stringify(mockData));
    const isReadySpy = jest.spyOn(redisService, 'isRedisReady').mockReturnValue(true);

    const middleware = cacheMiddleware('categories', 300);
    const req = {
      method: 'GET',
      user: { id: 'user123' },
      query: {},
    };
    const res = {
      setHeader: jest.fn(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
    expect(res.json).toHaveBeenCalledWith(mockData);
    expect(next).not.toHaveBeenCalled();

    getAsyncSpy.mockRestore();
    isReadySpy.mockRestore();
  });

  it('should call next and set MISS header on cache MISS', async () => {
    const getAsyncSpy = jest.spyOn(redisService, 'getAsync').mockResolvedValue(null);
    const setAsyncSpy = jest.spyOn(redisService, 'setAsync').mockResolvedValue();
    const isReadySpy = jest.spyOn(redisService, 'isRedisReady').mockReturnValue(true);

    const middleware = cacheMiddleware('transactions', 300);
    const req = {
      method: 'GET',
      user: { id: 'user123' },
      query: { limit: '10', page: '1' },
    };
    let capturedBody = null;
    const res = {
      statusCode: 200,
      setHeader: jest.fn(),
      json: function (body) {
        capturedBody = body;
        return this;
      },
    };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
    expect(next).toHaveBeenCalled();

    // Verify response interception
    const responsePayload = { success: true, data: [] };
    res.json(responsePayload);

    expect(capturedBody).toEqual(responsePayload);
    expect(setAsyncSpy).toHaveBeenCalled();

    getAsyncSpy.mockRestore();
    setAsyncSpy.mockRestore();
    isReadySpy.mockRestore();
  });

  it('should invalidate cache for specified user and prefixes', async () => {
    const deleteSpy = jest.spyOn(redisService, 'deleteKeysByPattern').mockResolvedValue();
    const isReadySpy = jest.spyOn(redisService, 'isRedisReady').mockReturnValue(true);

    await invalidateUserCache('user123', 'transactions', 'analytics');

    expect(deleteSpy).toHaveBeenCalledWith('sundae:user:user123:transactions*');
    expect(deleteSpy).toHaveBeenCalledWith('sundae:user:user123:analytics*');

    deleteSpy.mockRestore();
    isReadySpy.mockRestore();
  });
});
