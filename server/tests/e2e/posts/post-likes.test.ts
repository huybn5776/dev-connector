import express from 'express';

import request from 'supertest';

import App from '@/app';
import { PostLikeDto } from '@dtos/post-like.dto';
import { PostLike } from '@entities/post-like';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument } from '@models/user.model';
import {
  cleanAndDisconnectToDb,
  connectAndClearDb,
  insertUsers,
  clearDb,
  getApp,
  loginWithOfficer,
} from '@tests/e2e/e2e-utils';

describe('Post like tests', () => {
  let app: App;
  let server: express.Application;
  let officerUser: UserDocument;
  let seniorUser: UserDocument;
  let officerPost: PostDocument;

  beforeAll(async () => {
    await connectAndClearDb();
    app = await getApp();
    server = app.getServer();
  });

  beforeEach(async () => {
    await clearDb();
    [officerUser, seniorUser] = await insertUsers();
    officerPost = await new PostModel({
      user: officerUser,
      text: 'Aenean in turpis et nunc elementum eleifend non eu ex.',
      author: officerUser.fullName,
      avatar: officerUser.avatar,
    } as PostDocument).save();
  });

  afterAll(async () => {
    await cleanAndDisconnectToDb();
    app.close();
  });

  describe('[GET] /posts/:id/likes', () => {
    beforeEach(async () => {
      officerPost.likes = [{ user: officerUser }, { user: seniorUser }];
      await officerPost.save();
    });

    it('get all likes of post', async () => {
      const response = await request(server).get(`/api/posts/${officerPost._id}/likes`).expect(200);
      const likes: PostLikeDto[] = response.body;

      expect(likes).toHaveLength(2);
      expect(likes).toEqual(
        expect.arrayContaining([
        expect.objectContaining({ user: expect.objectContaining({ id: `${officerUser._id}` }) }),
          expect.objectContaining({ user: expect.objectContaining({ id: `${seniorUser._id}` }) }),
        ]),
      );
    });
  });

  describe('[POST] /posts/:id/likes', () => {
    let officerCookie = '';

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
    });

    it('like post without auth, 401', async () => {
      const response = await request(server).post(`/api/posts/${officerPost._id}/likes`);

      expect(response.statusCode).toBe(401);
    });

    it('like post, correctly save current user like to db', async () => {
      await request(server).post(`/api/posts/${officerPost._id}/likes`).set('cookie', officerCookie).expect(201);
      const likesInDb: PostLike[] = (await PostModel.findById(officerPost._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(1);
      expect(likesInDb).toEqual(expect.arrayContaining([expect.objectContaining({ user: officerUser._id })]));
      expect(likesInDb).toEqual(expect.not.arrayContaining([expect.objectContaining({ user: seniorUser._id })]));
    });

    it('like post, response post likes', async () => {
      officerPost.likes = [{ user: seniorUser }];
      await officerPost.save();

      const response = await request(server)
        .post(`/api/posts/${officerPost._id}/likes`)
        .set('cookie', officerCookie)
        .expect(201);
      const likes: PostLikeDto[] = response.body;

      expect(likes).toHaveLength(2);
      expect(likes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ user: { id: `${officerUser._id}` } }),
          expect.objectContaining({ user: { id: `${seniorUser._id}` } }),
        ]),
      );
    });

    it('like post that already liked, 400 and does not duplicate likes', async () => {
      officerPost.likes = [{ user: officerUser }];
      await officerPost.save();

      await request(server).post(`/api/posts/${officerPost._id}/likes`).set('cookie', officerCookie).expect(400);
      const likesInDb: PostLike[] = (await PostModel.findById(officerPost._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(1);
    });
  });

  describe('[DELETE] /posts/:id/likes', () => {
    let officerCookie = '';

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
    });

    it('delete post like without auth, 401', async () => {
      const response = await request(server).delete(`/api/posts/${officerPost._id}/likes`);

      expect(response.statusCode).toBe(401);
    });

    it('delete like of post, delete like of current user in db', async () => {
      officerPost.likes = [{ user: officerUser }];
      await officerPost.save();

      await request(server).delete(`/api/posts/${officerPost._id}/likes`).set('cookie', officerCookie).expect(200);
      const likesInDb: PostLike[] = (await PostModel.findById(officerPost._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(0);
    });

    it('delete like of post, does not delete like of other user', async () => {
      officerPost.likes = [{ user: officerUser }, { user: seniorUser }];
      await officerPost.save();

      await request(server).delete(`/api/posts/${officerPost._id}/likes`).set('cookie', officerCookie).expect(200);
      const likesInDb: PostLike[] = (await PostModel.findById(officerPost._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(1);
      expect(likesInDb).toEqual(expect.arrayContaining([expect.objectContaining({ user: seniorUser._id })]));
    });

    it('delete like of post, response post likes', async () => {
      officerPost.likes = [{ user: officerUser }, { user: seniorUser }];
      await officerPost.save();

      const response = await request(server)
        .delete(`/api/posts/${officerPost._id}/likes`)
        .set('cookie', officerCookie)
        .expect(200);
      const likes: PostLikeDto[] = response.body;

      expect(likes).toHaveLength(1);
      expect(likes).toEqual(expect.arrayContaining([expect.objectContaining({ user: { id: `${seniorUser._id}` } })]));
    });

    it('delete like of not liked post, 400', async () => {
      officerPost.likes = [{ user: seniorUser }];
      await officerPost.save();

      const response = await request(server).delete(`/api/posts/${officerPost._id}/likes`).set('cookie', officerCookie);
      expect(response.statusCode).toBe(400);
    });
  });
});
