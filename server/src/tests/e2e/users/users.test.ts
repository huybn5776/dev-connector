import assert from 'assert';

import express from 'express';

import request from 'supertest';

import App from '@/app';
import {
  cleanAndDisconnectToDb,
  connectAndClearDb,
  insertUsers,
  clearDb,
  getApp,
  officerUserData,
  createSenior,
  loginWithOfficer,
  getLoginRequest,
  createOfficer,
} from '@/tests/e2e/e2e-utils';
import { CreateUserDto } from '@dtos/create-user.dto';
import { PatchUserDto } from '@dtos/patch-user.dto';
import { UserDto } from '@dtos/user.dto';
import { User } from '@entities/user';
import { AuthToken } from '@interfaces/auth-token';
import { UserDocument, UserModel } from '@models/user.model';

describe('Users tests', () => {
  let app: App;
  let server: express.Application;

  beforeAll(async () => {
    await connectAndClearDb();
    app = await getApp();
    server = app.getServer();
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await cleanAndDisconnectToDb();
    app.close();
  });

  describe('[GET] /users', () => {
    let users: UserDocument[];

    beforeEach(async () => {
      users = await insertUsers();
    });

    it('get users, response correct fields', async () => {
      const response = await request(server).get('/api/users').expect(200);
      const usersDto: UserDto[] = response.body;

      expect(usersDto).toHaveLength(users.length);
      for (let i = 0; i < users.length; i += 1) {
        assertUser(usersDto[i], users[i]);
      }
    });
  });

  describe('[GET] /users/:id', () => {
    let officerUser: UserDocument;
    let seniorUser: UserDocument;

    beforeEach(async () => {
      [officerUser, seniorUser] = await insertUsers();
    });

    it('get officer user, response correct fields', async () => {
      const response = await request(server).get(`/api/users/${officerUser._id}`).expect(200);
      const userDto: UserDto = response.body;

      assertUser(userDto, officerUser);
    });

    it('get senior user, response correct fields', async () => {
      const response = await request(server).get(`/api/users/${seniorUser._id}`).expect(200);
      const userDto: UserDto = response.body;

      assertUser(userDto, seniorUser);
    });
  });

  describe('[POST] /users/me', () => {
    let userData: CreateUserDto;

    beforeEach(async () => {
      userData = getOfficerUserData();
    });

    it('create user, does saved to db', async () => {
      const response = await request(server).post('/api/users').send(userData).expect(201);
      const authToken: AuthToken = response.body;
      const { user } = authToken;

      assert(user !== null);
      const userDocument: UserDocument | null = await UserModel.findById(user?.id);

      assert(userDocument !== null);
      expect(userDocument.fullName).toBe(userData.fullName);
      expect(userDocument.username).toBe(userData.username);
      expect(userDocument.email).toBe(userData.email);
      expect(userDocument.avatar).toMatch(/www.gravatar.com\/avatar\//);
    });

    it('create user, response correct fields', async () => {
      const response = await request(server).post('/api/users').send(userData).expect(201);
      const authToken: AuthToken = response.body;
      const { user } = authToken;

      assert(user !== null);
      expect(user?.fullName).toBe(userData?.fullName);
      expect(user?.username).toBe(userData?.username);
      expect(user?.email).toBe(userData?.email);
      expect(user?.avatar).toMatch(/www.gravatar.com\/avatar\//);
    });

    it('create user with used username, 409', async () => {
      const seniorUser = await (await createSenior()).save();

      userData = {
        ...userData,
        fullName: 'Domingo',
        username: seniorUser.username,
      };
      const response = await request(server).post('/api/users').send(userData);

      expect(response.statusCode).toBe(409);
    });

    it('create user with used email, 409', async () => {
      const seniorUser = await (await createSenior()).save();

      userData = {
        ...userData,
        fullName: 'Domingo',
        email: seniorUser.email,
      };
      const response = await request(server).post('/api/users').send(userData);

      expect(response.statusCode).toBe(409);
    });
  });

  describe('[PATCH] /users/me', () => {
    let officerUser: UserDocument;
    let officerCookie = '';

    beforeEach(async () => {
      officerUser = await (await createOfficer()).save();
      officerCookie = await loginWithOfficer(server);
    });

    it('patch user without auth, 401', async () => {
      const userData: PatchUserDto = { fullName: 'Domingo' };

      const response = await request(server).patch('/api/users/me').send(userData);

      expect(response.statusCode).toBe(401);
    });

    it('patch user fullName, does saved to db', async () => {
      const userData: PatchUserDto = { fullName: 'Domingo' };

      await request(server).patch('/api/users/me').set('cookie', officerCookie).send(userData).expect(200);
      const userDocument: UserDocument | null = await UserModel.findById(officerUser._id);

      assert(userDocument !== null);
      assertUser(userDocument, { ...officerUser.toObject(), ...userData });
    });

    it('patch user username, response correct fields', async () => {
      const userData: PatchUserDto = { fullName: 'Domingo' };

      const response = await request(server)
        .patch('/api/users/me')
        .set('cookie', officerCookie)
        .send(userData)
        .expect(200);
      const user: UserDto = response.body;

      assertUser(user, { ...officerUser.toObject(), ...userData });
    });

    it('patch user password, only able to login with new password', async () => {
      const userData = { password: 'aiDae9cie' };

      await request(server).patch('/api/users/me').set('cookie', officerCookie).send(userData).expect(200);

      const loginWithOldPassword = await getLoginRequest(server, officerUser.email, officerUser.password);
      expect(loginWithOldPassword.statusCode).toBe(401);

      const loginWithNewPassword = await getLoginRequest(server, officerUser.email, userData.password);
      expect(loginWithNewPassword.statusCode).toBe(200);
    });
  });

  describe('[DELETE] /users/me', () => {
    let officerUser: UserDocument;
    let officerCookie = '';

    beforeEach(async () => {
      officerUser = await (await createOfficer()).save();
      officerCookie = await loginWithOfficer(server);
    });

    it('delete user without auth, 401', async () => {
      const response = await request(server).delete('/api/users/me');

      expect(response.statusCode).toBe(401);
    });

    it('delete current user, does delete it in db', async () => {
      await request(server).delete('/api/users/me').set('cookie', officerCookie).expect(204);
      const userDocument: UserDocument | null = await UserModel.findById(officerUser._id);

      expect(userDocument).toBeNull();
    });
  });

  function assertUser(userDto: UserDto | UserDocument | undefined, user: User | UserDocument | undefined): void {
    expect(userDto).toHaveSameId(user);
    expect(userDto?.fullName).toBe(user?.fullName);
    expect(userDto?.username).toBe(user?.username);
    expect(userDto?.email).toBe(user?.email);
    expect(userDto?.avatar).toBe(user?.avatar);
  }

  function getOfficerUserData(): CreateUserDto {
    return {
      fullName: officerUserData.fullName,
      username: officerUserData.username,
      email: officerUserData.email,
      password: officerUserData.password,
    };
  }
});
