import request from 'supertest';
import app from '../app.js';
import Otp from '../models/Otp.js';
import { createTestUser } from './helpers/testAuth.js';

describe('Auth API', () => {
  it('registers a user with verified email', async () => {
    const email = `register-${Date.now()}@cyberhex.test`;
    await Otp.create({
      email: email.toLowerCase(),
      code: '000000',
      verified: true,
      expiresAt: new Date(Date.now() + 3600000),
    });

    const res = await request(app).post('/api/v1/auth/register').send({
      username: `user_${Date.now()}`,
      email,
      password: 'Password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('logs in an existing user', async () => {
    const { email, password } = await createTestUser();

    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});