const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const mongoose = require('mongoose');

describe('Auth & Security API', () => {
  const testUser = { email: 'test@sundae.local', password: 'password123' };
  
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
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
      .send({ email: 'hacker@sundae.local', password: 'password123' });
      
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });

  it('should block mutations without a valid CSRF token', async () => {
    process.env.ALLOW_REGISTRATION = 'true';
    await request(app).post('/api/auth/register').send(testUser);
    
    const loginRes = await request(app).post('/api/auth/login').send(testUser);
    const cookies = loginRes.headers['set-cookie'];
    
    const accessCookie = cookies.find(c => c.startsWith('accessToken'));
    
    const expenseRes = await request(app)
      .post('/api/expenses')
      .set('Cookie', accessCookie)
      .send({ name: 'Hack', amount: 100, categoryId: new mongoose.Types.ObjectId(), date: new Date() });
      
    expect(expenseRes.statusCode).toEqual(403);
    expect(expenseRes.body.message).toMatch(/Invalid CSRF token/);
  });
});
