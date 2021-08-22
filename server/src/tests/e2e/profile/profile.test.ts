import assert from 'assert';

import express from 'express';

import request from 'supertest';

import App from '@/app';
import {
  assertProfile,
  assertProfileExperiences,
  assertProfileEducations, assertPartialUser,
} from '@/tests/e2e/asserts';
import {
  cleanAndDisconnectToDb,
  connectAndClearDb,
  insertUsers,
  clearDb,
  loginWithOfficer,
  getApp,
  createOfficerProfile,
  createSeniorProfile,
} from '@/tests/e2e/e2e-utils';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { ProfileDto } from '@dtos/profile.dto';
import { Profile } from '@entities/profile';
import { GithubRepo } from '@interfaces/github-repo';
import { ProfileDocument, ProfileModel } from '@models/profile.model';
import { UserDocument } from '@models/user.model';
import { deleteNilProperties } from '@utils/object-utils';
import { RecursivePartial } from '@utils/type-utils';

describe('Profile tests', () => {
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

  describe('[GET] /profile', () => {
    it(`all user have profile, response all user's profiles with correct fields`, async () => {
      const [officerProfile, seniorProfile] = await ProfileModel.insertMany([
        createOfficerProfile(),
        createSeniorProfile(),
      ]);
      officerProfile.user = officerUser;
      seniorProfile.user = seniorUser;

      const response = await request(server).get('/api/profile').expect(200);
      const profilesDto: ProfileDto[] = response.body;

      expect(profilesDto).toHaveLength(2);
      [officerProfile, seniorProfile].forEach((profileDocument) => {
        const profileDto = profilesDto.find((profile) => profile.user.id === `${profileDocument.user._id}`);
        assert(profileDto !== undefined);
        assertProfile(profileDto, profileDocument);
        assertPartialUser(profileDto.user, profileDocument.user);
        expect(profileDto.experiences).not.toBeDefined();
        expect(profileDto.educations).not.toBeDefined();
      });
    });

    it(`partial user have profile, response partial user's profiles`, async () => {
      const seniorProfile = await createSeniorProfile().save();

      const response = await request(server).get('/api/profile').expect(200);
      const profilesDto: ProfileDto[] = response.body;

      expect(profilesDto).toHaveLength(1);
      expect(profilesDto).toEqual(expect.arrayContaining([expect.objectContaining({ id: `${seniorProfile._id}` })]));
    });
  });

  describe('[GET] /profile/user/:userId', () => {
    it('get profile of user that has profile, response profile with correct fields', async () => {
      const [officerProfile] = await ProfileModel.insertMany([createOfficerProfile(), createSeniorProfile()]);

      const response = await request(server).get(`/api/profile/user/${officerUser._id}`).expect(200);
      const profileDto: ProfileDto = response.body;

      assertProfile(profileDto, officerProfile);
      assertPartialUser(profileDto.user, officerUser);
      assertProfileExperiences(profileDto.experiences, officerProfile.experiences);
      assertProfileEducations(profileDto.educations, officerProfile.educations);
    });

    it('get profile of user that does not have profile, 404', async () => {
      await ProfileModel.insertMany([createSeniorProfile()]);

      const response = await request(server).get(`/api/profile/user/${officerUser._id}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('[POST] /profile/me', () => {
    let officerCookie = '';
    let officerProfileData: CreateProfileDto;
    let partialProfileData: CreateProfileDto;

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
      officerProfileData = getOfficerProfileData();
      partialProfileData = {
        status: 'Developer',
        skills: ['JavaScript', 'HTML'],
      };
    });

    it('create profile without auth, 401', async () => {
      const response = await request(server).post('/api/profile/me').send(officerProfileData);

      expect(response.statusCode).toBe(401);
    });

    it('create profile when does not have profile, does saved to db', async () => {
      await request(server).post('/api/profile/me').set('cookie', officerCookie).send(officerProfileData).expect(201);
      const savedProfile: ProfileDocument | null = await ProfileModel.findOne({ user: officerUser });

      assert(savedProfile !== null);
      assertProfile(savedProfile, { ...officerProfileData, user: officerUser });
      expect(savedProfile.experiences).toHaveLength(0);
      expect(savedProfile.educations).toHaveLength(0);
    });

    it('create profile when does not have profile, response correct fields', async () => {
      const response = await request(server)
        .post('/api/profile/me')
        .set('cookie', officerCookie)
        .send(officerProfileData)
        .expect(201);
      const profileDto: ProfileDto = response.body;

      assertProfile(profileDto, { ...officerProfileData, user: officerUser });
      assertPartialUser(profileDto.user, officerUser);
      expect(profileDto.experiences).toHaveLength(0);
      expect(profileDto.educations).toHaveLength(0);
    });

    it('create profile when user already have profile, override original profile in db', async () => {
      await createOfficerProfile().save();

      await request(server).post('/api/profile/me').set('cookie', officerCookie).send(partialProfileData).expect(201);
      const savedProfile: ProfileDocument | null = await ProfileModel.findOne({ user: officerUser });

      assert(savedProfile !== null);
      assertProfile(savedProfile, { ...partialProfileData, user: officerUser });
      expect(savedProfile.experiences).toHaveLength(0);
      expect(savedProfile.educations).toHaveLength(0);
    });

    it('create profile when user already have profile, response overridden profile', async () => {
      await createOfficerProfile().save();

      const response = await request(server)
        .post('/api/profile/me')
        .set('cookie', officerCookie)
        .send(partialProfileData)
        .expect(201);
      const profileDto: ProfileDto = response.body;

      assertProfile(profileDto, { ...partialProfileData, user: officerUser });
      assertPartialUser(profileDto.user, officerUser);
      expect(profileDto.experiences).toHaveLength(0);
      expect(profileDto.educations).toHaveLength(0);
    });

    it('create profile with extra fields, should not save other fields', async () => {
      const profileData: RecursivePartial<Profile> = {
        ...partialProfileData,
        user: { _id: `${seniorUser._id}}` },
      };
      await request(server).post('/api/profile/me').set('cookie', officerCookie).send(profileData).expect(201);
      const savedProfile: ProfileDocument | null = await ProfileModel.findOne({ user: officerUser });

      expect(`${savedProfile?.user._id}`).toBe(`${officerUser._id}`);
    });
  });

  describe('[PATCH] /profile/me', () => {
    let officerCookie = '';
    let partialProfileData: CreateProfileDto;

    beforeEach(async () => {
      officerCookie = await loginWithOfficer(server);
      partialProfileData = {
        status: 'Developer',
        skills: ['JavaScript', 'HTML'],
      };
    });

    it('patch profile without auth, 401', async () => {
      const response = await request(server).patch('/api/profile/me').send(partialProfileData);

      expect(response.statusCode).toBe(401);
    });

    it('patch profile, dose updated to db', async () => {
      await createOfficerProfile().save();

      await request(server).patch('/api/profile/me').set('cookie', officerCookie).send(partialProfileData).expect(200);
      const updatedProfile: ProfileDocument | null = await ProfileModel.findOne({ user: officerUser });

      assert(updatedProfile !== null);
      expect(updatedProfile.status).toBe(partialProfileData.status);
      expect(new Set(updatedProfile.skills)).toEqual(new Set(partialProfileData.skills));
    });

    it('patch profile of user that does not have profile, 404', async () => {
      const response = await request(server)
        .patch('/api/profile/me')
        .set('cookie', officerCookie)
        .send(partialProfileData);

      expect(response.statusCode).toBe(404);
    });

    it('patch profile, return profile detail', async () => {
      const officerProfile = await createOfficerProfile().save();

      const response = await request(server)
        .patch('/api/profile/me')
        .set('cookie', officerCookie)
        .send(partialProfileData)
        .expect(200);
      const profileDto: ProfileDto = response.body;

      assertProfile(profileDto, { ...officerProfile.toObject(), ...partialProfileData, user: officerUser });
      assertPartialUser(profileDto.user, officerUser);
      assertProfileExperiences(profileDto.experiences, officerProfile.experiences);
      assertProfileEducations(profileDto.educations, officerProfile.educations);
    });

    it('patch profile with extra fields, should not update other fields', async () => {
      await createOfficerProfile().save();

      const profileData: RecursivePartial<Profile> = {
        user: { _id: `${seniorUser._id}}` },
      };
      await request(server).patch('/api/profile/me').set('cookie', officerCookie).send(profileData).expect(200);
      const updatedProfile: ProfileDocument | null = await ProfileModel.findOne({ user: officerUser });

      expect(`${updatedProfile?.user._id}`).toBe(`${officerUser._id}`);
    });
  });

  describe('[GET] /profile/githubRepos/:username', () => {
    it('get github repos', async () => {
      const response = await request(server)
        .get(`/api/profile/githubRepos/${createOfficerProfile().githubUsername}`)
        .expect(200);
      const githubRepos: GithubRepo[] = response.body;

      expect(githubRepos.length).toBeGreaterThan(0);
      githubRepos.forEach((githubRepo) => {
        expect(githubRepo.name).toBeDefined();
        expect(githubRepo.description).toBeDefined();
        expect(githubRepo.owner).toBeDefined();
        expect(githubRepo.stargazerCount).toEqual(expect.any(Number));
        expect(githubRepo.forkCount).toEqual(expect.any(Number));
        expect(githubRepo.watcherCount).toEqual(expect.any(Number));
      });
    });
  });

  function getOfficerProfileData(): CreateProfileDto {
    const unsavedOfficerProfile = createOfficerProfile();
    return {
      company: unsavedOfficerProfile.company,
      website: unsavedOfficerProfile.website,
      location: unsavedOfficerProfile.location,
      status: unsavedOfficerProfile.status,
      skills: [...unsavedOfficerProfile.skills],
      bio: unsavedOfficerProfile.bio,
      githubUsername: unsavedOfficerProfile.githubUsername,
      social: deleteNilProperties(unsavedOfficerProfile.social),
    };
  }
});
