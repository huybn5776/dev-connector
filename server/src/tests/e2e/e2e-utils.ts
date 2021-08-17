/* eslint-disable import/first */
process.env.NODE_CONFIG_DIR = `${process.cwd()}/src/configs`;
process.env.NODE_ENV = 'test';

import { dbConnection } from '@databases';
import bcrypt from 'bcrypt';
import { connection, connect } from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';

import App from '@/app';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { UserDto } from '@dtos/user.dto';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';
import { ProfileEducation } from '@entities/profile-education';
import { ProfileExperience } from '@entities/profile-experience';
import { ProfileSocial } from '@entities/profile-social';
import { User } from '@entities/user';
import { AuthToken } from '@interfaces/auth-token';
import { PostCommentDocument, PostCommentModel } from '@models/post-comment.model';
import { PostDocument, PostModel } from '@models/post.model';
import { ProfileModel, ProfileDocument } from '@models/profile.model';
import { UserDocument, UserModel } from '@models/user.model';

export async function connectToTestDb(): Promise<void> {
  await connect(dbConnection.url, dbConnection.options);
}

export async function connectAndClearDb(): Promise<void> {
  await connectToTestDb();
  return clearDb();
}

export async function cleanAndDisconnectToDb(): Promise<void> {
  await clearDb();
  return connection.close();
}

export async function clearDb(): Promise<void> {
  const collections = await connection.db.listCollections().toArray();
  await Promise.all(collections.map((collection) => connection.db.dropCollection(collection.name)));
}

export async function insertUsers(): Promise<UserDocument[]> {
  return UserModel.insertMany([await createOfficer(), await createSenior()]);
}

export async function insertProfiles(): Promise<ProfileDocument[]> {
  return ProfileModel.insertMany([createOfficerProfile(), createSeniorProfile()]);
}

export async function insertPosts(userId: string): Promise<PostDocument[]> {
  return PostModel.insertMany([
    { user: userId, text: 'Aenean in turpis et nunc elementum eleifend non eu ex.' },
    {
      user: userId,
      text: 'Bibendum nibh volutpat, dictum neque sed, euismod turpis. Maecenas scelerisque lorem non leo molestie, eget scelerisque libero pharetra',
    },
  ] as PostDocument[]);
}

export const officerUserData = {
  _id: '61191d088072a39bd1d3b4bb',
  name: 'Fabien Potencier',
  email: 'fabien@symfony.com',
  password: 'ohcaiJuk8Iqu',
  avatar: 'https://www.gravatar.com/avatar/9a22d09f92d50fa3d2a16766d0ba52f8',
};
export const seniorUserData = {
  _id: '4e47f1000000000000000000',
  name: 'Minko Gechev',
  email: 'mgechev@gmail.com',
  password: 'QuooNg6au9ph',
  avatar: 'https://www.gravatar.com/avatar/82bafb0432ce4ccc9dcc26f94d5fe5bc',
};

export async function createOfficer(): Promise<UserDocument> {
  return new UserModel({
    ...officerUserData,
    password: await bcrypt.hash(officerUserData.password, 10),
  });
}

export async function createSenior(): Promise<UserDocument> {
  return new UserModel({
    ...seniorUserData,
    password: await bcrypt.hash(seniorUserData.password, 10),
  });
}

export function createOfficerProfile(): ProfileDocument {
  return new ProfileModel({
    user: officerUserData._id,
    company: 'Symfony',
    website: 'http://fabien.potencier.org/',
    location: 'Lille',
    status: 'Other',
    skills: ['PHP', 'Go', 'C', 'Python', 'JavaScript'],
    bio: 'founder @blackfireio; founder, project lead and CEO @Symfony',
    githubUsername: 'fabpot',
    social: {
      twitter: 'https://twitter.com/fabpot',
      linkedin: 'https://www.linkedin.com/in/fabienpotencier/',
    } as ProfileSocial,
    experiences: [
      {
        title: 'Principal CEO',
        company: 'Symfony SAS',
        location: 'Île-de-France Clichy',
        from: new Date(2018, 1, 1),
        current: true,
      },
      {
        title: 'Owner/CEO',
        company: 'Blackfire.io',
        location: 'Paris',
        from: new Date(2014, 12, 1),
        current: true,
      },
      {
        title: 'Owner/CEO',
        company: 'SensioLabs',
        location: 'Paris',
        from: new Date(2012, 7, 1),
        to: new Date(2019, 12, 1),
      },
    ] as ProfileExperience[],
    educations: [
      {
        school: 'HEC Paris Business School',
        degree: 'Mastère Entrepreneurs',
        fieldOfStudy: 'Management',
        from: new Date(1997, 1, 1),
        to: new Date(1998, 1, 1),
      },
      {
        school: 'Mines de Nancy',
        degree: 'Ecole Nationale Supérieure des',
        fieldOfStudy: 'Art & Design',
        from: new Date(1994, 1, 1),
        to: new Date(1997, 1, 1),
      },
    ] as ProfileEducation[],
  });
}

export function createSeniorProfile(): ProfileDocument {
  return new ProfileModel({
    user: seniorUserData._id,
    company: 'Google',
    website: 'https://blog.mgechev.com/',
    location: 'San Francisco',
    status: 'Senior Developer',
    skills: ['TypeScript', 'Go', 'Java'],
    bio: 'Developer Relations Lead at Google ',
    githubUsername: 'mgechev',
    social: {
      youtube: 'https://www.youtube.com/channel/UCiTl76Qnz7MHLHy57zvdIsg',
      twitter: 'https://twitter.com/mgechev',
      facebook: 'https://www.facebook.com/minko.gechev.5',
      linkedin: 'https://www.linkedin.com/in/mgechev/',
      instagram: 'https://twitter.com/mgechev/status/898627164089729025',
    } as ProfileSocial,
    experiences: [
      {
        title: 'Relations Engineer',
        company: 'Google',
        location: 'San Francisco',
        from: new Date(2018, 11, 1),
        current: true,
      },
      {
        title: 'Co-Founder & CTO',
        company: 'Rhyme',
        location: 'San Francisco',
        from: new Date(2017, 8, 1),
        to: new Date(2018, 10, 1),
      },
    ] as ProfileExperience[],
    educations: [
      {
        school: 'Sofia University St. Kliment Ohridski',
        degree: 'Master of Science (MSc)',
        fieldOfStudy: 'Software Engineering',
        from: new Date(2013, 1, 1),
        to: new Date(2015, 1, 1),
      },
    ] as ProfileEducation[],
  });
}

export async function getApp(): Promise<App> {
  return (await import('@/server')).default;
}

export function loginWithOfficer(server: Express.Application): Promise<string> {
  return getAuthCookie(server, officerUserData.name, officerUserData.password);
}

export function loginWithSenior(server: Express.Application): Promise<string> {
  return getAuthCookie(server, seniorUserData.name, seniorUserData.password);
}

async function getAuthCookie(server: Express.Application, username: string, password: string): Promise<string> {
  const authToken: AuthToken = (
    await request(server)
      .post('/api/oauth/token')
      .send({
        grant_type: 'password',
        username,
        password,
      })
      .expect(200)
  ).body;
  return `Authorization=${authToken.access_token}`;
}

export function assertUser(userDto: UserDto | undefined, user: User | undefined): void {
  expect(userDto?.id).toBe(`${user?._id}`);
  expect(userDto?.name).toBe(user?.name);
  expect(userDto?.avatar).toBe(user?.avatar);
}

export function assertComment(commentDto: PostCommentDto, comment: PostComment): void {
  expect(commentDto.text).toBe(comment.text);
  expect(commentDto.name).toBe(comment.name);
  expect(commentDto.avatar).toBe(comment.avatar);
  assertUser(commentDto.user, comment.user);

  expect(commentDto.likes).toHaveLength(comment.likes.length);
}

export function assertListingLikes(postLikesDto: PostLikeDto[], postLikes: PostLike[]): void {
  expect(postLikesDto).toHaveLength(postLikes.length);

  for (let i = 0; i < postLikes.length; i += 1) {
    const postLikeDto = postLikesDto[i];
    const postLike = postLikes[i];
    expect(postLikeDto.user.id).toBe(`${postLike.user._id}`);

    // should not have detail information in listing api
    expect(postLikeDto.user.name).not.toBeDefined();
    expect(postLikeDto.user.email).not.toBeDefined();
    expect(postLikeDto.user.avatar).not.toBeDefined();
  }
}

export function createPostCommentDocument(user: User, text: string): PostCommentDocument {
  return new PostCommentModel({ text, user, name: user.name, avatar: user.avatar } as Partial<PostComment>);
}
