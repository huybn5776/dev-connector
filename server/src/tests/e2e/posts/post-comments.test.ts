import express from 'express';

import request from 'supertest';

import App from '@/app';
import {
  cleanAndDisconnectToDb,
  connectAndClearDb,
  insertUsers,
  clearDb,
  loginWithSenior,
  loginWithOfficer,
  getApp,
  assertListingLikes,
  assertUser,
  createPostCommentDocument,
} from '@/tests/e2e/e2e-utils';
import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostComment } from '@entities/post-comment';
import { PostCommentModel, PostCommentDocument } from '@models/post-comment.model';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument } from '@models/user.model';
import { RecursivePartial } from '@utils/type-utils';

describe('Post comment tests', () => {
  let app: App;
  let server: express.Application;
  let officerUser: UserDocument;
  let seniorUser: UserDocument;
  let officerPost: PostDocument;
  let seniorPost: PostDocument;

  beforeAll(async () => {
    await connectAndClearDb();
    app = await getApp();
    server = app.getServer();
  });

  beforeEach(async () => {
    await clearDb();
    [officerUser, seniorUser] = await insertUsers();
    [officerPost, seniorPost] = await PostModel.insertMany([
      {
        user: officerUser,
        text: 'Aenean in turpis et nunc elementum eleifend non eu ex.',
        name: officerUser.name,
        avatar: officerUser.avatar,
      } as PostDocument,
      {
        user: seniorUser,
        text: 'Bibendum nibh volutpat, dictum neque sed, euismod turpisseniorUser.',
        name: seniorUser.name,
        avatar: seniorUser.avatar,
      } as PostDocument,
    ]);
  });

  afterAll(async () => {
    await cleanAndDisconnectToDb();
    app.close();
  });

  describe('[GET] /posts/:id/comments', () => {
    beforeEach(async () => {
      officerPost.comments.push(
        ...(await PostCommentModel.insertMany([
          createPostCommentDocument(officerUser, 'Mauris ac quam.'),
          createPostCommentDocument(officerUser, 'Nunc fermentum vitae.'),
          createPostCommentDocument(seniorUser, 'Odio nisi.'),
        ])),
      );
      await officerPost.save();
      seniorPost.comments.push(
        ...(await PostCommentModel.insertMany([
          createPostCommentDocument(officerUser, 'Porta in lectus.'),
          createPostCommentDocument(seniorUser, 'Quisque rutrum ullamcorper ante.'),
        ])),
      );
      await seniorPost.save();
    });

    it('response all comments', async () => {
      const response = await request(server).get(`/api/posts/${officerPost._id}/comments`).expect(200);
      const commentsDto: PostCommentDto[] = response.body;

      expect(commentsDto).toHaveLength(officerPost.comments.length);
    });

    it('response all comments with correct fields', async () => {
      const response = await request(server).get(`/api/posts/${officerPost._id}/comments`).expect(200);
      const commentsDto: PostCommentDto[] = response.body;

      for (let i = 0; i < officerPost.comments.length; i += 1) {
        expect(commentsDto[i].user?.id).toBe(`${officerPost.comments[i].user._id}`);
        expect(commentsDto[i].text).toBe(officerPost.comments[i].text);
        expect(commentsDto[i].name).toBe(officerPost.comments[i].name);
        expect(commentsDto[i].avatar).toBe(officerPost.comments[i].avatar);
        assertListingLikes(commentsDto[i].likes, officerPost.comments[i].likes);
      }
    });
  });

  describe('[POST] /posts/:id/comments', () => {
    let officerCookie = '';

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
    });

    it('add comment without auth, 401', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      const response = await request(server).post(`/api/posts/${officerPost._id}/comments`).send(commentData);
      expect(response.statusCode).toBe(401);
    });

    it('add comment, does saved to db', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      const response = await request(server)
        .post(`/api/posts/${officerPost._id}/comments`)
        .set('cookie', officerCookie)
        .send(commentData)
        .expect(201);
      const commentDto: PostCommentDto = response.body;
      const commentDocument: PostCommentDocument | null = await PostCommentModel.findById(commentDto.id);
      expect(commentDocument?.text).toBe(commentData.text);
    });

    it('add comment, does updated the post in db', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      await request(server)
        .post(`/api/posts/${officerPost._id}/comments`)
        .set('cookie', officerCookie)
        .send(commentData)
        .expect(201);

      const postComments: PostCommentDocument[] =
        (await PostModel.findById(officerPost._id).populate('comments'))?.comments || [];
      expect(postComments).toHaveLength(1);
      expect(postComments[0].text).toBe(commentData.text);
    });

    it('add comment, does not replace other comment of same post', async () => {
      const originalComment = createPostCommentDocument(officerUser, 'Mauris ac quam.');
      await originalComment.save();
      officerPost.comments.push(originalComment);
      await officerPost.save();

      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      await request(server)
        .post(`/api/posts/${officerPost._id}/comments`)
        .set('cookie', officerCookie)
        .send(commentData)
        .expect(201);

      const postComments: PostComment[] =
        (await PostModel.findById(officerPost._id).populate('comments'))?.toObject().comments || [];
      expect(postComments).toHaveLength(2);
      expect(postComments).toEqual(
        expect.arrayContaining([expect.objectContaining({ _id: originalComment._id })]),
      );
    });

    it('add comment, return comment detail', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      const response = await request(server)
        .post(`/api/posts/${officerPost._id}/comments`)
        .set('cookie', officerCookie)
        .send(commentData)
        .expect(201);
      const commentDto: PostCommentDto = response.body;

      assertUser(commentDto.user, officerUser);
      expect(commentDto.text).toBe(commentData.text);
      expect(commentDto.name).toBe(officerUser.name);
      expect(commentDto.avatar).toBe(officerUser.avatar);
      expect(commentDto.likes).toHaveLength(0);
    });

    it('add comment with extra fields, should not save other fields', async () => {
      const commentData: RecursivePartial<PostComment> = {
        user: { _id: `${seniorUser._id}}` },
        text: 'Praesent ultrices.',
        name: seniorUser.name,
        avatar: seniorUser.avatar,
        likes: [{ user: officerUser.id }, { user: seniorUser.id }],
      };
      const response = await request(server)
        .post(`/api/posts/${officerPost._id}/comments`)
        .set('cookie', officerCookie)
        .send(commentData);
      const commentDto: PostCommentDto = response.body;
      const savedComment: PostCommentDocument | null = await PostCommentModel.findById(commentDto.id);

      expect(`${savedComment?.user._id}`).toBe(`${officerUser._id}`);
      expect(savedComment?.name).toBe(officerUser.name);
      expect(savedComment?.avatar).toBe(officerUser.avatar);
      expect(savedComment?.likes).toHaveLength(0);
    });
  });

  describe('[PATCH] /posts/:id/comments', () => {
    let officerCookie = '';
    let officerComment: PostCommentDocument;
    let seniorComment: PostCommentDocument;

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
      officerComment = createPostCommentDocument(officerUser, 'Mauris ac quam.');
      seniorComment = createPostCommentDocument(seniorUser, 'Odio nisi.');
      officerPost.comments.push(...(await PostCommentModel.insertMany([officerComment, seniorComment])));
      await officerPost.save();
    });

    it('patch comment without auth, 401', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      const response = await request(server).patch(`/api/posts/comments/${officerComment._id}`).send(commentData);

      expect(response.statusCode).toBe(401);
    });

    it('patch comment, dose updated to db', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      const response = await request(server)
        .patch(`/api/posts/comments/${officerComment._id}`)
        .set('cookie', officerCookie)
        .send(commentData)
        .expect(200);
      const commentDto: PostCommentDto = response.body;
      const updatedComment: PostCommentDocument | null = await PostCommentModel.findById(commentDto.id);

      expect(updatedComment?.text).toBe(commentData.text);
    });

    it('patch comment, does not affect other comments in same post', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      const originalCommentsCount = officerPost.comments.length;
      const originalComments = [...officerPost.comments];

      await request(server)
        .patch(`/api/posts/comments/${officerComment._id}`)
        .set('cookie', officerCookie)
        .send(commentData)
        .expect(200);
      const postComments: PostCommentDocument[] =
        (await PostModel.findById(officerPost._id).populate('comments'))?.comments || [];

      expect(postComments).toHaveLength(originalCommentsCount);

      originalComments
        .filter((originalComment) => `${originalComment._id}` !== `${officerComment._id}`)
        .forEach((originalComment) => {
          const comment = postComments.find((c) => `${c._id}` === `${originalComment._id}`);
          expect(comment).toBeDefined();
          expect(`${comment?.user._id}`).toBe(`${originalComment.user._id}`);
          expect(comment?.text).toBe(originalComment.text);
          expect(comment?.name).toBe(originalComment.name);
          expect(comment?.avatar).toBe(originalComment.avatar);
          expect(comment?.updatedAt.getTime()).toBe(originalComment.updatedAt.getTime());
        });
    });

    it('patch comment, return comment detail', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };
      const response = await request(server)
        .patch(`/api/posts/comments/${officerComment._id}`)
        .set('cookie', officerCookie)
        .send(commentData)
        .expect(200);
      const commentDto: PostCommentDto = response.body;

      assertUser(commentDto.user, officerUser);
      expect(commentDto.text).toBe(commentData.text);
      expect(commentDto.name).toBe(officerUser.name);
      expect(commentDto.avatar).toBe(officerUser.avatar);
      expect(commentDto.likes).toBeDefined();
    });

    it('patch comment with extra fields, should not update other fields', async () => {
      const commentData: RecursivePartial<PostComment> = {
        user: { _id: `${seniorUser._id}}` },
        text: 'Praesent ultrices.',
        name: seniorUser.name,
        avatar: seniorUser.avatar,
        likes: [{ user: officerUser.id }, { user: seniorUser.id }],
      };
      const response = await request(server)
        .patch(`/api/posts/comments/${officerComment._id}`)
        .set('cookie', officerCookie)
        .send(commentData)
        .expect(200);
      const commentDto: PostCommentDto = response.body;
      const updatedComment: PostCommentDocument | null = await PostCommentModel.findById(commentDto.id).populate(
        'user',
      );

      expect(`${updatedComment?.user._id}`).toBe(`${officerUser._id}`);
      expect(updatedComment?.name).toBe(officerUser.name);
      expect(updatedComment?.avatar).toBe(officerUser.avatar);
      expect(updatedComment?.likes).toHaveLength(0);
    });

    it('patch the comment that does not belong to that user, 403', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };

      const officerResponse = await request(server)
        .patch(`/api/posts/comments/${seniorComment._id}`)
        .set('cookie', officerCookie)
        .send(commentData);
      expect(officerResponse.statusCode).toBe(403);

      const seniorCookie = await loginWithSenior(server);
      const seniorResponse = await request(server)
        .patch(`/api/posts/comments/${officerComment._id}`)
        .set('cookie', seniorCookie)
        .send(commentData);
      expect(seniorResponse.statusCode).toBe(403);
    });
  });

  describe('[DELETE] /posts/:postId/comments/:commentId', () => {
    let officerCookie = '';
    let officerComment: PostCommentDocument;
    let seniorComment: PostCommentDocument;

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
      officerComment = createPostCommentDocument(officerUser, 'Mauris ac quam.');
      seniorComment = createPostCommentDocument(seniorUser, 'Odio nisi.');
      officerPost.comments.push(...(await PostCommentModel.insertMany([officerComment, seniorComment])));
      await officerPost.save();
    });

    it('delete comment without auth, 401', async () => {
      const response = await request(server).delete(`/api/posts/${officerPost._id}/comments/${officerComment._id}`);

      expect(response.statusCode).toBe(401);
    });

    it('delete comment, dose delete the comment in db', async () => {
      await request(server)
        .delete(`/api/posts/${officerPost._id}/comments/${officerComment._id}`)
        .set('cookie', officerCookie)
        .expect(200);
      const deletedComment = await PostCommentModel.findById(officerComment._id);

      expect(deletedComment).toBeNull();
    });

    it('delete comment, dose update the post comments', async () => {
      const originalCommentsCount = officerPost.comments.length;

      await request(server)
        .delete(`/api/posts/${officerPost._id}/comments/${officerComment._id}`)
        .set('cookie', officerCookie)
        .expect(200);
      const postComments: PostComment[] =
        (await PostModel.findById(officerPost._id).populate('comments'))?.toObject().comments || [];

      expect(postComments).toHaveLength(originalCommentsCount - 1);
      expect(postComments).toEqual(
        expect.not.arrayContaining([expect.objectContaining({ _id: officerComment._id })]),
      );
    });

    it('delete comment, not mis-deleted other comment in db', async () => {
      await request(server)
        .delete(`/api/posts/${officerPost._id}/comments/${officerComment._id}`)
        .set('cookie', officerCookie)
        .expect(200);
      const seniorCommentDocument = await PostCommentModel.findById(seniorComment._id);

      expect(seniorCommentDocument).not.toBeNull();
    });

    it('delete comment, keep other comments in same post', async () => {
      await request(server)
        .delete(`/api/posts/${officerPost._id}/comments/${officerComment._id}`)
        .set('cookie', officerCookie)
        .expect(200);
      const postComments: PostComment[] =
        (await PostModel.findById(officerPost._id).populate('comments'))?.toObject().comments || [];

      expect(postComments).toEqual(expect.arrayContaining([expect.objectContaining({ _id: seniorComment._id })]));
    });

    it('delete the comment that does not belong to that user, 403', async () => {
      const commentData: CreatePostCommentDto = { text: 'Praesent ultrices.' };

      const officerResponse = await request(server)
        .delete(`/api/posts/${officerPost._id}/comments/${seniorComment._id}`)
        .set('cookie', officerCookie)
        .send(commentData);
      expect(officerResponse.statusCode).toBe(403);

      const seniorCookie = await loginWithSenior(server);
      const seniorResponse = await request(server)
        .delete(`/api/posts/${officerPost._id}/comments/${officerComment._id}`)
        .set('cookie', seniorCookie)
        .send(commentData);
      expect(seniorResponse.statusCode).toBe(403);
    });
  });
});
