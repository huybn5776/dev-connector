import assert from 'assert';

import express from 'express';

import request from 'supertest';

import App from '@/app';
import {
  connectAndClearDb,
  getApp,
  clearDb,
  cleanAndDisconnectToDb,
  insertUsers,
  officerUserData,
  seniorUserData,
  loginWithOfficer,
} from '@/tests/e2e/e2e-utils';
import { AuthRequest } from '@dtos/auth-request';
import { User } from '@entities/user';
import { AuthToken } from '@interfaces/auth-token';
import { UserDocument } from '@models/user.model';

describe('Auth tests', () => {
  let app: App;
  let server: express.Application;
  let officerUser: UserDocument;
  let seniorUser: UserDocument;

  beforeAll(async () => {
    await connectAndClearDb();
    app = await getApp();
    server = app.getServer();
  });

  beforeEach(async () => {
    await clearDb();
    [officerUser, seniorUser] = await insertUsers();
  });

  afterAll(async () => {
    await cleanAndDisconnectToDb();
    app.close();
  });

  describe('[POST] /oauth/auth', () => {
    it('login without grant_type, 400', async () => {
      const authData = {
        username: officerUserData.email,
        password: officerUserData.password,
      };
      const response = await request(server).post('/api/oauth/token').send(authData);

      expect(response.statusCode).toBe(400);
    });

    it('login with officer username, response token and user', async () => {
      const authData: AuthRequest = {
        grant_type: 'password',
        username: officerUserData.username,
        password: officerUserData.password,
      };
      const response = await request(server).post('/api/oauth/token').send(authData).expect(200);
      const authToken: AuthToken = response.body;

      assertAuthToken(authToken, officerUser);
    });

    it('login with officer email, response token and user', async () => {
      const authData: AuthRequest = {
        grant_type: 'password',
        username: officerUserData.email,
        password: officerUserData.password,
      };
      const response = await request(server).post('/api/oauth/token').send(authData).expect(200);
      const authToken: AuthToken = response.body;

      assertAuthToken(authToken, officerUser);
    });

    it('login with senior, response token and user', async () => {
      const authData = {
        grant_type: 'password',
        username: seniorUserData.username,
        password: seniorUserData.password,
      };
      const response = await request(server).post('/api/oauth/token').send(authData).expect(200);
      const authToken: AuthToken = response.body;

      assertAuthToken(authToken, seniorUser);
    });

    it('login with officer, set auth cookie', async () => {
      const authData = {
        grant_type: 'password',
        username: seniorUserData.username,
        password: seniorUserData.password,
      };
      await request(server)
        .post('/api/oauth/token')
        .send(authData)
        .expect(200)
        .expect('Set-Cookie', /^Authorization=.+/);
    });
  });

  describe('[POST] /oauth/revoke', () => {
    it('logout without auth, 401', async () => {
      const response = await request(server).post('/api/oauth/revoke');

      expect(response.statusCode).toBe(401);
    });

    it('logout, remove auth cookie', async () => {
      const officerCookie = await loginWithOfficer(server);

      await request(server)
        .post('/api/oauth/revoke')
        .set('cookie', officerCookie)
        .expect(200)
        .expect('Set-Cookie', /^Authorization=;/);
    });
  });

  function assertAuthToken(authToken: AuthToken, user: User): void {
    expect(authToken.access_token).toBeDefined();
    expect(authToken.token_type).toBe('Bearer');
    expect(authToken.expires_in).toBeGreaterThan(0);
    expect(authToken.expires).toBeGreaterThan(new Date().getTime());
    assert(authToken.user !== undefined);
    expect(authToken.user.fullName).toBe(user.fullName);
    expect(authToken.user.username).toBe(user.username);
    expect(authToken.user.email).toBe(user.email);
    expect(authToken.user.avatar).toBe(user.avatar);
  }
});
