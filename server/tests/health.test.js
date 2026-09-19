import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';

describe('Health Check & Keep Alive API', () => {
  it('GET /api/health returns status 200 with keep-alive metadata', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
    expect(typeof res.body.uptime).toEqual('number');
    expect(res.body.keepAlive).toBeDefined();
    expect(res.body.keepAlive.intervalSeconds).toEqual(15);
    expect(res.body.keepAlive.targetUrl).toContain('/api/health');
  });

  it('GET /health also responds with 200', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  it('GET /api/health/ping executes manual ping and returns result', async () => {
    const res = await request(app).get('/api/health/ping');

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/Manual keep-alive ping/);
    expect(res.body.result).toBeDefined();
    expect(res.body.keepAlive).toBeDefined();
  });
});
