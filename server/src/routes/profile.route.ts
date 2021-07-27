import { Router } from 'express';

import Route from '@/interfaces/routes';
import ProfileController from '@controllers/profile.controller';
import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileEducationDto } from '@dtos/patch-profile-education.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import authMiddleware from '@middlewares/auth.middleware';
import { asyncHandler } from '@middlewares/error.middleware';
import validationMiddleware from '@middlewares/validation.middleware';

class ProfileRoute implements Route {
  readonly path = '/profile';
  readonly router = Router();
  readonly profileController = new ProfileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, asyncHandler(this.profileController.getAllProfiles));
    this.router.get(`${this.path}/user/:userId`, asyncHandler(this.profileController.getProfilesWithId));
    this.router.get(`${this.path}/me`, authMiddleware, asyncHandler(this.profileController.getCurrentUserProfile));
    this.router.post(
      `${this.path}/me`,
      validationMiddleware(CreateProfileDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.profileController.updateCurrentUserProfile),
    );
    this.router.patch(
      `${this.path}/me`,
      validationMiddleware(PatchProfileDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.profileController.patchCurrentUserProfile),
    );
    this.router.post(
      `${this.path}/me/experiences/`,
      validationMiddleware(CreateProfileExperienceDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.profileController.addCurrentUserExperience),
    );
    this.router.patch(
      `${this.path}/me/experiences/:id`,
      validationMiddleware(PatchProfileExperienceDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.profileController.patchCurrentUserExperience),
    );
    this.router.delete(
      `${this.path}/me/experiences/:id`,
      authMiddleware,
      asyncHandler(this.profileController.deleteCurrentUserProfileExperience),
    );
    this.router.post(
      `${this.path}/me/educations`,
      validationMiddleware(CreateProfileEducationDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.profileController.addCurrentUserEducation),
    );
    this.router.patch(
      `${this.path}/me/educations/:id`,
      validationMiddleware(PatchProfileEducationDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.profileController.patchCurrentUserEducation),
    );
    this.router.delete(
      `${this.path}/me/educations/:id`,
      authMiddleware,
      asyncHandler(this.profileController.deleteCurrentUserProfileEducation),
    );
    this.router.get(`${this.path}/github/:username`, asyncHandler(this.profileController.getGithubProfile));
  }
}

export default ProfileRoute;
