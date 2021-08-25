import express from 'express';

import request from 'supertest';

import App from '@/app';
import { PostLikeDto } from '@dtos/post-like.dto';
import { PostLike } from '@entities/post-like';
import { PostCommentDocument, PostCommentModel } from '@models/post-comment.model';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument } from '@models/user.model';
import {
  cleanAndDisconnectToDb,
  connectAndClearDb,
  insertUsers,
  clearDb,
  getApp,
  loginWithOfficer,
  createPostCommentDocument,
} from '@tests/e2e/e2e-utils';

describe('Post comment like tests', () => {
  let app: App;
  let server: express.Application;
  let officerUser: UserDocument;
  let seniorUser: UserDocument;
  let officerPost: PostDocument;
  let officerComment: PostCommentDocument;

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

    officerComment = await createPostCommentDocument(officerUser, 'Mauris ac quam.').save();
    officerPost.comments.push(officerComment);
    await officerPost.save();
  });

  afterAll(async () => {
    await cleanAndDisconnectToDb();
    app.close();
  });

  describe('[GET] /posts/comments/:id/likes', () => {
    beforeEach(async () => {
      officerComment.likes = [{ user: officerUser }, { user: seniorUser }];
      await officerComment.save();
    });

    it('get all likes of comment', async () => {
      const response = await request(server).get(`/api/posts/comments/${officerComment._id}/likes`).expect(200);
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

  describe('[POST] /posts/comments/:id/likes', () => {
    let officerCookie = '';

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
    });

    it('like comment without auth, 401', async () => {
      const response = await request(server).post(`/api/posts/comments/${officerComment._id}/likes`);

      expect(response.statusCode).toBe(401);
    });

    it('like comment, correctly save to db', async () => {
      await request(server)
        .post(`/api/posts/comments/${officerComment._id}/likes`)
        .set('cookie', officerCookie)
        .expect(201);
      const likesInDb: PostLike[] = (await PostCommentModel.findById(officerComment._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(1);
      expect(likesInDb).toEqual(expect.arrayContaining([expect.objectContaining({ user: officerUser._id })]));
      expect(likesInDb).toEqual(expect.not.arrayContaining([expect.objectContaining({ user: seniorUser._id })]));
    });

    it('like comment, does not also like the post', async () => {
      await request(server)
        .post(`/api/posts/comments/${officerComment._id}/likes`)
        .set('cookie', officerCookie)
        .expect(201);
      const likesInDb: PostLike[] = (await PostModel.findById(officerPost._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(0);
    });

    it('like comment, response comment likes', async () => {
      officerComment.likes = [{ user: seniorUser }];
      await officerComment.save();

      const response = await request(server)
        .post(`/api/posts/comments/${officerComment._id}/likes`)
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

    it('like comment that already liked, 400 and does not duplicate likes', async () => {
      officerComment.likes = [{ user: officerUser }];
      await officerComment.save();

      await request(server)
        .post(`/api/posts/comments/${officerComment._id}/likes`)
        .set('cookie', officerCookie)
        .expect(400);
      const likesInDb: PostLike[] = (await PostCommentModel.findById(officerComment._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(1);
    });
  });

  describe('[DELETE] /posts/comment/:id/likes', () => {
    let officerCookie = '';

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
    });

    it('delete comment like without auth, 401', async () => {
      const response = await request(server).delete(`/api/posts/comments/${officerComment._id}/likes`);

      expect(response.statusCode).toBe(401);
    });

    it('delete comment like, delete like of current user in db', async () => {
      officerComment.likes = [{ user: officerUser }];
      await officerComment.save();

      await request(server)
        .delete(`/api/posts/comments/${officerComment._id}/likes`)
        .set('cookie', officerCookie)
        .expect(200);
      const likesInDb: PostLike[] = (await PostCommentModel.findById(officerComment._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(0);
    });

    it('delete like of post, does not delete like of other user', async () => {
      officerComment.likes = [{ user: officerUser }, { user: seniorUser }];
      await officerComment.save();

      await request(server)
        .delete(`/api/posts/comments/${officerComment._id}/likes`)
        .set('cookie', officerCookie)
        .expect(200);
      const likesInDb: PostLike[] = (await PostCommentModel.findById(officerComment._id))?.toObject().likes || [];

      expect(likesInDb).toHaveLength(1);
      expect(likesInDb).toEqual(expect.arrayContaining([expect.objectContaining({ user: seniorUser._id })]));
    });

    it('delete like of comment, response comment likes', async () => {
      officerComment.likes = [{ user: officerUser }, { user: seniorUser }];
      await officerComment.save();

      const response = await request(server)
        .delete(`/api/posts/comments/${officerComment._id}/likes`)
        .set('cookie', officerCookie)
        .expect(200);
      const likes: PostLikeDto[] = response.body;

      expect(likes).toHaveLength(1);
      expect(likes).toEqual(expect.arrayContaining([expect.objectContaining({ user: { id: `${seniorUser._id}` } })]));
    });

    it('delete like of not liked comment, 400', async () => {
      officerComment.likes = [{ user: seniorUser }];
      await officerComment.save();

      const response = await request(server)
        .delete(`/api/posts/comments/${officerComment._id}/likes`)
        .set('cookie', officerCookie);
      expect(response.statusCode).toBe(400);
    });
  });
});
