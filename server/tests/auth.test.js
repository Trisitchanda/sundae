import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import mongoose from 'mongoose';

describe('Auth & Security API', () => {
  const testUser = { email: 'test@sundae.local', password: 'password123' };
  let csrfCookie;
  let csrfToken;

  beforeAll(async () => {
    const res = await request(app).get('/api/auth/me'); // Just to get the cookie
    const cookies = res.headers['set-cookie'] || [];
    csrfCookie = cookies.find(c => c.startsWith('_csrf='));
    if (csrfCookie) {
      csrfToken = csrfCookie.split(';')[0].split('=')[1];
    }
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Cookie', csrfCookie)
      .set('x-csrf-token', csrfToken)
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    
    const dbUser = await User.findOne({ email: testUser.email });
    expect(dbUser).toBeTruthy();
  });

  it('should prevent registration if ALLOW_REGISTRATION is false and user exists', async () => {
    process.env.ALLOW_REGISTRATION = 'false';
    await User.create({ email: 'owner@sundae.local', passwordHash: 'hash', role: 'ADMIN' });
    
    const res = await request(app)
      .post('/api/auth/register')
      .set('Cookie', csrfCookie)
      .set('x-csrf-token', csrfToken)
      .send({ email: 'hacker@sundae.local', password: 'password123' });
      
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });

  it('should block mutations without a valid CSRF token', async () => {
    process.env.ALLOW_REGISTRATION = 'true';
    await request(app).post('/api/auth/register')
      .set('Cookie', csrfCookie)
      .set('x-csrf-token', csrfToken)
      .send(testUser);
    
    const loginRes = await request(app).post('/api/auth/login')
      .set('Cookie', csrfCookie)
      .set('x-csrf-token', csrfToken)
      .send(testUser);
    
    const cookies = loginRes.headers['set-cookie'] || [];
    const accessCookie = cookies.find(c => c.startsWith('accessToken'));
    
    const expenseRes = await request(app)
      .post('/api/transactions')
      .set('Cookie', accessCookie) // no CSRF token provided here!
      .send({ type: 'EXPENSE', amount: 100, categoryId: new mongoose.Types.ObjectId(), date: new Date(), description: 'Hack' });
      
    expect(expenseRes.statusCode).toEqual(403);
    expect(expenseRes.body.message).toMatch(/Invalid CSRF token/);
  });
});
