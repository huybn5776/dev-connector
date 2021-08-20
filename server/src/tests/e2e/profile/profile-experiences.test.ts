import express from 'express';

import request from 'supertest';

import App from '@/app';
import { assertProfileExperience, assertProfileExperiences } from '@/tests/e2e/asserts';
import {
  cleanAndDisconnectToDb,
  connectAndClearDb,
  insertUsers,
  clearDb,
  loginWithOfficer,
  getApp,
  createOfficerProfile,
  loginWithSenior,
} from '@/tests/e2e/e2e-utils';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';
import { ProfileExperience } from '@entities/profile-experience';
import { HttpException } from '@exceptions';
import { ProfileDocument, ProfileModel } from '@models/profile.model';
import { UserDocument } from '@models/user.model';

describe('Profiles experiences tests', () => {
  let app: App;
  let server: express.Application;
  let officerUser: UserDocument;
  let officerCookie = '';

  beforeAll(async () => {
    await connectAndClearDb();
    app = await getApp();
    server = app.getServer();
  });

  beforeEach(async () => {
    await clearDb();
    [officerUser] = await insertUsers();
    officerCookie = await loginWithOfficer(server);
  });

  afterAll(async () => {
    await cleanAndDisconnectToDb();
    app.close();
  });

  describe('[POST] /profile/me/experiences', () => {
    let officerProfile: ProfileDocument;
    let currentExperienceData: CreateProfileExperienceDto;
    let previousExperienceData: CreateProfileExperienceDto;

    beforeEach(async () => {
      officerProfile = createOfficerProfile();
      officerProfile.experiences = [];
      await officerProfile.save();

      currentExperienceData = {
        title: 'CEO',
        company: 'Brave Software',
        location: 'California San Francisco',
        from: new Date(2015, 5, 1),
        current: true,
      };
      previousExperienceData = {
        title: 'CTO and SVP Engineering',
        company: 'Mozilla',
        location: 'CA San Francisco',
        from: new Date(2013, 1, 1),
        to: new Date(2014, 3, 1),
      };
    });

    it('add experience without auth, 401', async () => {
      const response = await request(server).post('/api/profile/me/experiences').send(currentExperienceData);

      expect(response.statusCode).toBe(401);
    });

    it('add experience when does not have profile, 404', async () => {
      const seniorCookie = await loginWithSenior(server);

      const response = await request(server)
        .post('/api/profile/me/experiences')
        .set('cookie', seniorCookie)
        .send(currentExperienceData);

      expect(response.statusCode).toBe(404);
    });

    it('add experience, does saved to db', async () => {
      await request(server)
        .post('/api/profile/me/experiences')
        .set('cookie', officerCookie)
        .send(currentExperienceData)
        .expect(201);
      const experiences: ProfileExperience[] = (await ProfileModel.findOne({ user: officerUser }))?.experiences || [];

      expect(experiences).toHaveLength(1);
      assertProfileExperience(experiences[0], currentExperienceData);
    });

    it('add experience, response correct fields', async () => {
      const response = await request(server)
        .post('/api/profile/me/experiences')
        .set('cookie', officerCookie)
        .send(currentExperienceData)
        .expect(201);
      const experience: ProfileExperienceDto = response.body;

      expect(experience).toBeDefined();
      expect(experience.id).toBeDefined();
      assertProfileExperience(experience, currentExperienceData);
    });

    it('add multi experience, does saved to db', async () => {
      await request(server)
        .post('/api/profile/me/experiences')
        .set('cookie', officerCookie)
        .send(currentExperienceData)
        .expect(201);
      await request(server)
        .post('/api/profile/me/experiences')
        .set('cookie', officerCookie)
        .send(previousExperienceData)
        .expect(201);
      const experiences: ProfileExperience[] = (await ProfileModel.findOne({ user: officerUser }))?.experiences || [];

      expect(experiences).toHaveLength(2);
      expect(experiences).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: currentExperienceData.title } as ProfileExperience),
          expect.objectContaining({ title: previousExperienceData.title } as ProfileExperience),
        ]),
      );
    });

    it('add experience with missing fields, validateErrors', async () => {
      const experienceData: Partial<CreateProfileExperienceDto> = {
        title: 'CEO',
      };

      const response = await request(server)
        .post('/api/profile/me/experiences')
        .set('cookie', officerCookie)
        .send(experienceData)
        .expect(400);
      const error: HttpException = response.body;

      expect(error.validationErrors).toBeDefined();
      expect(error.validationErrors?.company).toBeDefined();
    });

    it('add experience with incorrect field type, validateErrors', async () => {
      const experienceData = {
        ...currentExperienceData,
        company: 1111,
        from: 'not a date',
      };

      const response = await request(server)
        .post('/api/profile/me/experiences')
        .set('cookie', officerCookie)
        .send(experienceData)
        .expect(400);
      const error: HttpException = response.body;

      expect(error.validationErrors).toBeDefined();
      expect(error.validationErrors?.company).toBeDefined();
      expect(error.validationErrors?.from).toBeDefined();
    });
  });

  describe('[PATCH] /profile/me/experiences/:id', () => {
    let partialExperienceData: PatchProfileExperienceDto;
    let originalExperiences: ProfileExperience[];
    let originalExperience: ProfileExperience;

    beforeEach(async () => {
      partialExperienceData = { title: 'Chief Architect' };
      const profile: ProfileDocument = await createOfficerProfile().save();
      originalExperiences = profile.toObject().experiences;
      [originalExperience] = originalExperiences;
    });

    it('patch experience without auth, 401', async () => {
      const response = await request(server)
        .patch(`/api/profile/me/experiences/${originalExperience._id}`)
        .send(partialExperienceData);

      expect(response.statusCode).toBe(401);
    });

    it('patch experience, dose updated to db', async () => {
      await request(server)
        .patch(`/api/profile/me/experiences/${originalExperience._id}`)
        .set('cookie', officerCookie)
        .send(partialExperienceData)
        .expect(200);
      const experiences: ProfileExperience[] = (await ProfileModel.findOne({ user: officerUser }))?.experiences || [];

      expect(experiences).toHaveLength(originalExperiences.length);
      expect(experiences).toEqual(
        expect.arrayContaining([expect.objectContaining({ ...originalExperience, ...partialExperienceData })]),
      );
    });

    it('patch experience, return experience detail', async () => {
      const response = await request(server)
        .patch(`/api/profile/me/experiences/${originalExperience._id}`)
        .set('cookie', officerCookie)
        .send(partialExperienceData)
        .expect(200);
      const experience: ProfileExperienceDto = response.body;

      expect(experience.id).toBe(`${originalExperience._id}`);
      assertProfileExperience(experience, { ...originalExperience, ...experience });
    });
  });

  describe('[DELETE] /profile/me/experiences/:id', () => {
    let originalExperiences: ProfileExperience[];
    let firstExperience: ProfileExperience;

    beforeEach(async () => {
      const profile: ProfileDocument = await createOfficerProfile().save();
      originalExperiences = profile.toObject().experiences;
      [firstExperience] = originalExperiences;
    });

    it('delete experience without auth, 401', async () => {
      const response = await request(server).delete(`/api/profile/me/experiences/${firstExperience._id}`);

      expect(response.statusCode).toBe(401);
    });

    it('delete experience, does delete it in db', async () => {
      await request(server)
        .delete(`/api/profile/me/experiences/${firstExperience._id}`)
        .set('cookie', officerCookie)
        .expect(200);
      const experiences: ProfileExperience[] = (await ProfileModel.findOne({ user: officerUser }))?.experiences || [];

      expect(experiences).toHaveLength(originalExperiences.length - 1);
      expect(experiences).toEqual(expect.not.arrayContaining([expect.objectContaining({ _id: firstExperience._id })]));
      assertProfileExperiences(
        experiences,
        originalExperiences.filter((experience) => `${experience._id}` !== `${firstExperience._id}`),
      );
    });

    it('delete experience, return experiences', async () => {
      const response = await request(server)
        .delete(`/api/profile/me/experiences/${firstExperience._id}`)
        .set('cookie', officerCookie)
        .expect(200);
      const experiences: ProfileExperienceDto[] = response.body;

      expect(experiences).toHaveLength(originalExperiences.length - 1);
      expect(experiences).toEqual(
        expect.not.arrayContaining([expect.objectContaining({ id: `${firstExperience._id}` })]),
      );
      assertProfileExperiences(
        experiences,
        originalExperiences.filter((experience) => `${experience._id}` !== `${firstExperience._id}`),
      );
    });
  });
});
