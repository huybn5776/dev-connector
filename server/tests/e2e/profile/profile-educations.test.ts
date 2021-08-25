import express from 'express';

import request from 'supertest';

import App from '@/app';
import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { PatchProfileEducationDto } from '@dtos/patch-profile-education.dto';
import { ProfileEducationDto } from '@dtos/profile-education.dto';
import { ProfileEducation } from '@entities/profile-education';
import { ProfileDocument, ProfileModel } from '@models/profile.model';
import { UserDocument } from '@models/user.model';
import { assertProfileEducation, assertProfileEducations } from '@tests/e2e/asserts';
import {
  cleanAndDisconnectToDb,
  connectAndClearDb,
  insertUsers,
  clearDb,
  loginWithOfficer,
  getApp,
  createOfficerProfile,
  loginWithSenior,
} from '@tests/e2e/e2e-utils';

describe('Profiles educations tests', () => {
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

  describe('[POST] /profile/me/educations', () => {
    let officerProfile: ProfileDocument;
    let lastEducationData: CreateProfileEducationDto;
    let penultimateEducationData: CreateProfileEducationDto;

    beforeEach(async () => {
      officerProfile = createOfficerProfile();
      officerProfile.educations = [];
      await officerProfile.save();

      lastEducationData = {
        school: 'University of Illinois at Urbana-Champaign',
        degree: 'MS',
        fieldOfStudy: 'Computer Science',
        from: new Date(1983, 1, 1),
        to: new Date(1985, 1, 1),
      };
      penultimateEducationData = {
        school: 'Santa Clara University',
        degree: 'BS',
        fieldOfStudy: 'Math/Computer Science',
        from: new Date(1979, 1, 1),
        to: new Date(1983, 1, 1),
      };
    });

    it('add education without auth, 401', async () => {
      const response = await request(server).post('/api/profile/me/educations').send(lastEducationData);

      expect(response.statusCode).toBe(401);
    });

    it('add education when does not have profile, 404', async () => {
      const seniorCookie = await loginWithSenior(server);

      const response = await request(server)
        .post('/api/profile/me/educations')
        .set('cookie', seniorCookie)
        .send(lastEducationData);

      expect(response.statusCode).toBe(404);
    });

    it('add education, does saved to db', async () => {
      await request(server)
        .post('/api/profile/me/educations')
        .set('cookie', officerCookie)
        .send(lastEducationData)
        .expect(201);
      const educations: ProfileEducation[] = (await ProfileModel.findOne({ user: officerUser }))?.educations || [];

      expect(educations).toHaveLength(1);
      assertProfileEducation(educations[0], lastEducationData);
    });

    it('add education, response correct fields', async () => {
      const response = await request(server)
        .post('/api/profile/me/educations')
        .set('cookie', officerCookie)
        .send(lastEducationData)
        .expect(201);
      const education: ProfileEducationDto = response.body;

      expect(education).toBeDefined();
      expect(education.id).toBeDefined();
      assertProfileEducation(education, lastEducationData);
    });

    it('add multi education, does saved to db', async () => {
      await request(server)
        .post('/api/profile/me/educations')
        .set('cookie', officerCookie)
        .send(lastEducationData)
        .expect(201);
      await request(server)
        .post('/api/profile/me/educations')
        .set('cookie', officerCookie)
        .send(penultimateEducationData)
        .expect(201);
      const educations: ProfileEducation[] = (await ProfileModel.findOne({ user: officerUser }))?.educations || [];

      expect(educations).toHaveLength(2);
      expect(educations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ school: lastEducationData.school } as ProfileEducation),
          expect.objectContaining({ school: penultimateEducationData.school } as ProfileEducation),
        ]),
      );
    });
  });

  describe('[PATCH] /profile/me/educations/:id', () => {
    let partialEducationData: PatchProfileEducationDto;
    let originalEducations: ProfileEducation[];
    let originalEducation: ProfileEducation;

    beforeEach(async () => {
      partialEducationData = { school: 'Stanford University' };
      const profile: ProfileDocument = await createOfficerProfile().save();
      originalEducations = profile.toObject().educations;
      [originalEducation] = originalEducations;
    });

    it('patch education without auth, 401', async () => {
      const response = await request(server)
        .patch(`/api/profile/me/educations/${originalEducation._id}`)
        .send(partialEducationData);

      expect(response.statusCode).toBe(401);
    });

    it('patch education, dose updated to db', async () => {
      await request(server)
        .patch(`/api/profile/me/educations/${originalEducation._id}`)
        .set('cookie', officerCookie)
        .send(partialEducationData)
        .expect(200);
      const educations: ProfileEducation[] = (await ProfileModel.findOne({ user: officerUser }))?.educations || [];

      expect(educations).toHaveLength(originalEducations.length);
      expect(educations).toEqual(
        expect.arrayContaining([expect.objectContaining({ ...originalEducation, ...partialEducationData })]),
      );
    });

    it('patch education, return education detail', async () => {
      const response = await request(server)
        .patch(`/api/profile/me/educations/${originalEducation._id}`)
        .set('cookie', officerCookie)
        .send(partialEducationData)
        .expect(200);
      const education: ProfileEducationDto = response.body;

      expect(education.id).toBe(`${originalEducation._id}`);
      assertProfileEducation(education, { ...originalEducation, ...education });
    });
  });

  describe('[DELETE] /profile/me/educations/:id', () => {
    let originalEducations: ProfileEducation[];
    let firstEducation: ProfileEducation;

    beforeEach(async () => {
      const profile: ProfileDocument = await createOfficerProfile().save();
      originalEducations = profile.toObject().educations;
      [firstEducation] = originalEducations;
    });

    it('delete education without auth, 401', async () => {
      const response = await request(server).delete(`/api/profile/me/educations/${firstEducation._id}`);

      expect(response.statusCode).toBe(401);
    });

    it('delete education, does delete it in db', async () => {
      await request(server)
        .delete(`/api/profile/me/educations/${firstEducation._id}`)
        .set('cookie', officerCookie)
        .expect(200);
      const educations: ProfileEducation[] = (await ProfileModel.findOne({ user: officerUser }))?.educations || [];

      expect(educations).toHaveLength(originalEducations.length - 1);
      expect(educations).toEqual(expect.not.arrayContaining([expect.objectContaining({ _id: firstEducation._id })]));
      assertProfileEducations(
        educations,
        originalEducations.filter((education) => `${education._id}` !== `${firstEducation._id}`),
      );
    });

    it('delete education, return educations', async () => {
      const response = await request(server)
        .delete(`/api/profile/me/educations/${firstEducation._id}`)
        .set('cookie', officerCookie)
        .expect(200);
      const educations: ProfileEducationDto[] = response.body;

      expect(educations).toHaveLength(originalEducations.length - 1);
      expect(educations).toEqual(
        expect.not.arrayContaining([expect.objectContaining({ id: `${firstEducation._id}` })]),
      );
      assertProfileEducations(
        educations,
        originalEducations.filter((education) => `${education._id}` !== `${firstEducation._id}`),
      );
    });
  });
});
