import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import bcrypt from 'bcrypt';

describe('Category API', () => {
  let accessCookie;
  let csrfCookie;
  let csrfToken;
  let testUserDoc;

  beforeAll(async () => {
    const meRes = await request(app).get('/api/auth/me');
    const cookies = meRes.headers['set-cookie'] || [];
    csrfCookie = cookies.find(c => c.startsWith('_csrf='));
    if (csrfCookie) {
      csrfToken = csrfCookie.split(';')[0].split('=')[1];
    }
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    testUserDoc = await User.create({
      email: 'categorytester@sundae.local',
      passwordHash,
      role: 'USER'
    });

    const loginRes = await request(app).post('/api/auth/login')
      .set('Cookie', csrfCookie)
      .set('x-csrf-token', csrfToken)
      .send({ email: 'categorytester@sundae.local', password: 'password123' });

    const cookies = loginRes.headers['set-cookie'] || [];
    accessCookie = cookies.find(c => c.startsWith('accessToken'));
  });

  it('should return deduplicated categories when global default and user category share the same name', async () => {
    await Category.create({ name: 'Food', isDefault: true, userId: null });
    await Category.create({ name: 'food', isDefault: false, userId: testUserDoc._id });

    const res = await request(app)
      .get('/api/categories')
      .set('Cookie', accessCookie);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    const foodCats = res.body.data.filter(c => c.name.toLowerCase() === 'food');
    expect(foodCats.length).toBe(1);
    expect(foodCats[0].isDefault).toBe(false);
  });

  it('should prevent creating a category that duplicates an existing default category', async () => {
    await Category.create({ name: 'Transport', isDefault: true, userId: null });

    const res = await request(app)
      .post('/api/categories')
      .set('Cookie', [accessCookie, csrfCookie].filter(Boolean))
      .set('x-csrf-token', csrfToken)
      .send({ name: 'transport' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/Category already exists/);
  });
});
