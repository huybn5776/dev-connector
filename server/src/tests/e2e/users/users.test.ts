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

  describe('[GET] /user/:id', () => {
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

  describe('[POST] /user/:id', () => {
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
      expect(userDocument.name).toBe(userData.name);
      expect(userDocument.email).toBe(userData.email);
      expect(userDocument.avatar).toMatch(/www.gravatar.com\/avatar\//);
    });

    it('create user, response correct fields', async () => {
      const response = await request(server).post('/api/users').send(userData).expect(201);
      const authToken: AuthToken = response.body;
      const { user } = authToken;

      assert(user !== null);
      expect(user?.name).toBe(userData?.name);
      expect(user?.email).toBe(userData?.email);
      expect(user?.avatar).toMatch(/www.gravatar.com\/avatar\//);
    });

    it('create user with used email, 409', async () => {
      const seniorUser = await (await createSenior()).save();

      userData = {
        ...userData,
        name: 'Domingo',
        email: seniorUser.email,
      };
      const response = await request(server).post('/api/users').send(userData);

      expect(response.statusCode).toBe(409);
    });
  });

  describe('[PATCH] /user/:id', () => {
    let officerUser: UserDocument;
    let officerCookie = '';

    beforeEach(async () => {
      officerUser = await (await createOfficer()).save();
      officerCookie = await loginWithOfficer(server);
    });

    it('patch user without auth, 401', async () => {
      const userData: PatchUserDto = { name: 'Domingo' };

      const response = await request(server).patch(`/api/users/${officerUser._id}`).send(userData);

      expect(response.statusCode).toBe(401);
    });

    it('patch user name, does saved to db', async () => {
      const userData: PatchUserDto = { name: 'Domingo' };

      await request(server)
        .patch(`/api/users/${officerUser._id}`)
        .set('cookie', officerCookie)
        .send(userData)
        .expect(200);
      const userDocument: UserDocument | null = await UserModel.findById(officerUser._id);

      assert(userDocument !== null);
      assertUser(userDocument, { ...officerUser.toObject(), ...userData });
    });

    it('patch user name, response correct fields', async () => {
      const userData: PatchUserDto = { name: 'Domingo' };

      const response = await request(server)
        .patch(`/api/users/${officerUser._id}`)
        .set('cookie', officerCookie)
        .send(userData)
        .expect(200);
      const user: UserDto = response.body;

      assertUser(user, { ...officerUser.toObject(), ...userData });
    });

    it('patch user password, only able to login with new password', async () => {
      const userData = { password: 'aiDae9cie' };

      await request(server)
        .patch(`/api/users/${officerUser._id}`)
        .set('cookie', officerCookie)
        .send(userData)
        .expect(200);

      const loginWithOldPassword = await getLoginRequest(server, officerUser.email, officerUser.password);
      expect(loginWithOldPassword.statusCode).toBe(401);

      const loginWithNewPassword = await getLoginRequest(server, officerUser.email, userData.password);
      expect(loginWithNewPassword.statusCode).toBe(200);
    });
  });

  describe('[DELETE] /user/:id', () => {
    let officerUser: UserDocument;
    let officerCookie = '';

    beforeEach(async () => {
      officerUser = await (await createOfficer()).save();
      officerCookie = await loginWithOfficer(server);
    });

    it('delete user without auth, 401', async () => {
      const response = await request(server).delete(`/api/users/${officerUser._id}`);

      expect(response.statusCode).toBe(401);
    });

    it('delete user, does delete it in db', async () => {
      await request(server)
        .delete(`/api/users/${officerUser._id}`)
        .set('cookie', officerCookie)
        .expect(204);
      const userDocument: UserDocument | null = await UserModel.findById(officerUser._id);

      expect(userDocument).toBeNull();
    });
  });

  function assertUser(userDto: UserDto | UserDocument | undefined, user: User | UserDocument | undefined): void {
    expect(userDto).toHaveSameId(user);
    expect(userDto?.name).toBe(user?.name);
    expect(userDto?.email).toBe(user?.email);
    expect(userDto?.avatar).toBe(user?.avatar);
  }

  function getOfficerUserData(): CreateUserDto {
    return {
      name: officerUserData.name,
      email: officerUserData.email,
      password: officerUserData.password,
    };
  }
});
