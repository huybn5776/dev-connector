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
  assertComment,
} from '@/tests/e2e/e2e-utils';
import { CreatePostDto } from '@dtos/create-post.dto';
import { PostDto } from '@dtos/post.dto';
import { Post } from '@entities/post';
import { PostCommentModel } from '@models/post-comment.model';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument } from '@models/user.model';
import { RecursivePartial } from '@utils/type-utils';

describe('Posts tests', () => {
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

  describe('[GET] /posts', () => {
    let posts: PostDocument[] = [];

    beforeEach(async () => {
      posts = await PostModel.insertMany([
        { user: officerUser, text: 'Aenean in turpis et nunc elementum eleifend non eu ex.' },
        { user: officerUser, text: 'Bibendum nibh volutpat, dictum neque sed, euismod turpisseniorUser.' },
        { user: seniorUser, text: 'Curabitur nec lectus eu felis gravida tempus vel eget lacus. Morbi pretium eros.' },
      ]);
    });

    it('response all posts', async () => {
      const responseData = await getPosts();

      expect(responseData).toHaveLength(posts.length);
    });

    it('response all posts with correct commentCount', async () => {
      await insertCommentToPosts();

      const responseData = await getPosts();

      for (let i = 0; i < posts.length; i += 1) {
        expect(responseData[i].commentsCount).toBe(posts[i].comments.length);
      }
    });

    it('response all posts with correct likes', async () => {
      await insertCommentToPosts();
      posts[0].likes.push({ user: officerUser }, { user: seniorUser });
      posts[1].likes.push({ user: seniorUser });
      await Promise.all([posts[0].save(), posts[1].save()]);

      const responseData = await getPosts();

      for (let i = 0; i < posts.length; i += 1) {
        expect(responseData[i].likes.length).toBe(posts[i].likes.length);
        assertListingLikes(responseData[i].likes, posts[i].likes);
      }
    });

    it('response all posts with only first comment', async () => {
      await insertCommentToPosts();

      const responseData = await getPosts();

      expect(responseData[0].comments.length).toBe(1);
      expect(responseData[1].comments.length).toBe(1);
      expect(responseData[0].comments[0].text).toBe(posts[0].comments[0].text);
      expect(responseData[1].comments[0].text).toBe(posts[1].comments[0].text);
    });

    it('response post with correct fields', async () => {
      const responseData = await getPost();

      expect(responseData.user?.id).toBe(`${officerUser._id}`);
      expect(responseData.user?.name).toBe(officerUser.name);
      expect(responseData.user?.avatar).toBe(officerUser.avatar);

      expect(responseData.text).toBe(posts[0].text);
      expect(responseData.name).toBe(posts[0].name);
      expect(responseData.avatar).toBe(posts[0].avatar);
      expect(responseData.likes.length).toBe(posts[0].likes.length);
      expect(responseData.comments.length).toBe(posts[0].comments.length);
    });

    it('response post with comments detail', async () => {
      await insertCommentToPosts();
      const post = posts[0];
      post.comments[0].likes.push({ user: officerUser }, { user: seniorUser });
      post.comments[1].likes.push({ user: seniorUser });
      await Promise.all([post.comments[0].save(), post.comments[1].save()]);
      post.likes.push({ user: officerUser });
      await Promise.all([post.save(), posts[1].save()]);

      const responseData = await getPost();

      expect(responseData.commentsCount).not.toBeDefined();
      for (let i = 0; i < post.comments.length; i += 1) {
        assertComment(responseData.comments[i], post.comments[i]);
        assertListingLikes(responseData.comments[i].likes, post.comments[i].likes);
      }
    });

    async function getPosts(): Promise<PostDto[]> {
      const response = await request(server).get('/api/posts').expect(200);
      return response.body;
    }

    async function getPost(): Promise<PostDto> {
      const post = posts[0];
      const response = await request(server).get(`/api/posts/${post._id}`).expect(200);
      return response.body;
    }

    async function insertCommentToPosts(): Promise<void> {
      posts[0].comments.push(
        await new PostCommentModel({ user: officerUser, text: 'Hello everyone.' }).save(),
        await new PostCommentModel({ user: officerUser, text: 'Goodbye all.' }).save(),
      );
      posts[1].comments.push(
        await new PostCommentModel({ user: officerUser, text: 'Like it.' }).save(),
        await new PostCommentModel({ user: officerUser, text: 'Great!!' }).save(),
        await new PostCommentModel({ user: officerUser, text: 'WTF' }).save(),
      );
      await Promise.all([posts[0].save(), posts[1].save()]);
    }
  });

  describe('[POST] /posts', () => {
    let cookie = '';

    beforeEach(async () => {
      cookie = await loginWithOfficer(server);
    });

    it('create post without auth, 401', async () => {
      const postData: CreatePostDto = { text: 'Aenean in turpis et nunc elementum eleifend non eu ex.' };
      const response = await request(server).post('/api/posts').send(postData);
      expect(response.statusCode).toBe(401);
    });

    it('create post, does saved to db', async () => {
      const postData: CreatePostDto = { text: 'Aenean in turpis et nunc elementum eleifend non eu ex.' };
      const response = await request(server).post('/api/posts').set('cookie', cookie).send(postData).expect(201);
      const postDto: PostDto = response.body;
      const savedPost: PostDocument | null = await PostModel.findById(postDto.id);

      expect(savedPost?.text).toBe(postData.text);
    });

    it('create post, return post detail', async () => {
      const postData: CreatePostDto = { text: 'Aenean in turpis et nunc elementum eleifend non eu ex.' };
      const response = await request(server).post('/api/posts').set('cookie', cookie).send(postData).expect(201);
      const postDto: PostDto = response.body;

      assertUser(postDto.user, officerUser);
      expect(postDto.text).toBe(postData.text);
      expect(postDto.name).toBe(officerUser.name);
      expect(postDto.avatar).toBe(officerUser.avatar);
      expect(postDto.likes).toHaveLength(0);
      expect(postDto.comments).toHaveLength(0);
      expect(postDto.commentsCount).not.toBeDefined();
    });

    it('create post with extra fields, should not save other fields', async () => {
      const postData: RecursivePartial<Post> = {
        user: { _id: `${seniorUser._id}}` },
        text: 'Curabitur nec.',
        name: seniorUser.name,
        avatar: seniorUser.avatar,
        likes: [{ user: officerUser.id }, { user: seniorUser.id }],
        comments: [{ text: 'Bark' }],
      };
      const response = await request(server).post('/api/posts').set('cookie', cookie).send(postData).expect(201);
      const postDto: PostDto = response.body;
      const savedPost: PostDocument | null = await PostModel.findById(postDto.id);

      expect(`${savedPost?.user._id}`).toBe(`${officerUser._id}`);
      expect(savedPost?.name).toBe(officerUser.name);
      expect(savedPost?.avatar).toBe(officerUser.avatar);
      expect(savedPost?.likes).toHaveLength(0);
      expect(savedPost?.comments).toHaveLength(0);
    });
  });

  describe('[PATCH] /posts', () => {
    let officerCookie = '';
    let officerPost: PostDocument;
    let seniorPost: PostDocument;

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
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

    it('patch post without auth, 401', async () => {
      const postData: CreatePostDto = { text: 'Curabitur nec.' };
      const response = await request(server).patch(`/api/posts/${officerPost._id}`).send(postData);
      expect(response.statusCode).toBe(401);
    });

    it('patch post, dose updated to db', async () => {
      const postData: CreatePostDto = { text: 'Curabitur nec.' };
      const response = await request(server)
        .patch(`/api/posts/${officerPost._id}`)
        .set('cookie', officerCookie)
        .send(postData)
        .expect(200);
      const postDto: PostDto = response.body;
      const updatedPost: PostDocument | null = await PostModel.findById(postDto.id);
      expect(updatedPost?.text).toBe(postData.text);
    });

    it('patch post, return post detail', async () => {
      const postData: CreatePostDto = { text: 'Curabitur nec.' };
      const response = await request(server)
        .patch(`/api/posts/${officerPost._id}`)
        .set('cookie', officerCookie)
        .send(postData)
        .expect(200);
      const postDto: PostDto = response.body;

      assertUser(postDto.user, officerUser);
      expect(postDto.text).toBe(postData.text);
      expect(postDto.name).toBe(officerUser.name);
      expect(postDto.avatar).toBe(officerUser.avatar);
      expect(postDto.likes).toBeDefined();
      expect(postDto.comments).toBeDefined();
      expect(postDto.commentsCount).not.toBeDefined();
    });

    it('patch post with extra fields, should not update other fields', async () => {
      const postData: RecursivePartial<Post> = {
        user: { _id: `${seniorUser._id}}` },
        text: 'Curabitur nec.',
        name: seniorUser.name,
        avatar: seniorUser.avatar,
        likes: [{ user: officerUser.id }, { user: seniorUser.id }],
        comments: [{ text: 'Bark' }],
      };
      const response = await request(server)
        .patch(`/api/posts/${officerPost._id}`)
        .set('cookie', officerCookie)
        .send(postData)
        .expect(200);
      const postDto: PostDto = response.body;
      const updatedPost: PostDocument | null = await PostModel.findById(postDto.id);

      expect(`${updatedPost?.user._id}`).toBe(`${officerPost.user._id}`);
      expect(updatedPost?.name).toBe(officerPost.name);
      expect(updatedPost?.avatar).toBe(officerPost.avatar);
      expect(updatedPost?.likes).toHaveLength(officerPost.likes.length);
      expect(updatedPost?.comments).toHaveLength(officerPost.comments.length);
    });

    it('patch the post that does not belong to that user, 403', async () => {
      const postData: CreatePostDto = { text: 'Curabitur nec.' };

      const officerResponse = await request(server)
        .patch(`/api/posts/${seniorPost._id}`)
        .set('cookie', officerCookie)
        .send(postData);
      expect(officerResponse.statusCode).toBe(403);

      const seniorCookie = await loginWithSenior(server);
      const seniorResponse = await request(server)
        .patch(`/api/posts/${officerPost._id}`)
        .set('cookie', seniorCookie)
        .send(postData);
      expect(seniorResponse.statusCode).toBe(403);
    });
  });

  describe('[DELETE] /posts', () => {
    let officerCookie = '';
    let officerPost: PostDocument;
    let seniorPost: PostDocument;

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);

      [officerPost, seniorPost] = await PostModel.insertMany([
        { user: officerUser, text: 'Aenean in turpis et nunc elementum eleifend non eu ex.' },
        { user: seniorUser, text: 'Bibendum nibh volutpat, dictum neque sed, euismod turpisseniorUser.' },
      ]);
    });

    it('delete post without auth, 401', async () => {
      const response = await request(server).delete(`/api/posts/${officerPost._id}`);
      expect(response.statusCode).toBe(401);
    });

    it('delete post, dose delete the post in db', async () => {
      await request(server).delete(`/api/posts/${officerPost._id}`).set('cookie', officerCookie).expect(204);
      const deletedPost = await PostModel.findById(officerPost._id);
      expect(deletedPost).toBeNull();
    });

    it('delete post, not mis-deleted other post in db', async () => {
      await request(server).delete(`/api/posts/${officerPost._id}`).set('cookie', officerCookie).expect(204);
      const seniorPostDocument = await PostModel.findById(seniorPost._id);
      expect(seniorPostDocument).not.toBeNull();
    });

    it('delete the post that does not belong to that user, 403', async () => {
      const officerResponse = await request(server).delete(`/api/posts/${seniorPost._id}`).set('cookie', officerCookie);
      expect(officerResponse.statusCode).toBe(403);

      const seniorCookie = await loginWithSenior(server);
      const seniorResponse = await request(server).delete(`/api/posts/${officerPost._id}`).set('cookie', seniorCookie);
      expect(seniorResponse.statusCode).toBe(403);
    });
  });
});
