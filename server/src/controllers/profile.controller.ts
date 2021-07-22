import { Request, Response } from 'express';

import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileEducationDto } from '@dtos/patch-profile-education.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { ProfileEducation } from '@interfaces/profile-education';
import { ProfileExperience } from '@interfaces/profile-experience';
import ProfileService from '@services/profile.service';

class ProfileController {
  readonly profileService = new ProfileService();

  public getAllProfiles = async (req: Request, res: Response): Promise<void> => {
    const profiles = await this.profileService.getProfiles();
    res.status(200).send(profiles);
  };

  public getProfilesWithId = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const profiles = await this.profileService.getUserProfile(userId);
    res.status(200).send(profiles);
  };

  public getCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const profile = await this.profileService.getUserProfile(userId);
    res.status(200).send(profile);
  };

  public patchCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const profileData: CreateProfileDto = req.body;
    const profile = await this.profileService.patchUserProfile(userId, profileData);
    res.status(200).send(profile);
  };

  public addCurrentUserExperience = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const experienceData: CreateProfileExperienceDto = req.body;
    const profileExperiences = await this.profileService.addUserProfileExperience(userId, experienceData);
    res.status(201).send(profileExperiences);
  };

  public patchCurrentUserExperience = async (req: Request, res: Response): Promise<void> => {
    const profileExperience = await this.patchData<PatchProfileExperienceDto, ProfileExperience>(
      req,
      this.profileService.patchUserProfileExperience.bind(this.profileService),
    );
    res.status(200).send(profileExperience);
  };

  public deleteCurrentUserProfileExperience = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const experienceId: string = req.params.id;
    const profileExperiences = await this.profileService.deleteProfileExperienceOfUser(userId, experienceId);
    res.status(200).send(profileExperiences);
  };

  public addCurrentUserEducation = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const education = req.body;
    const profileEducation = await this.profileService.addUserProfileEducation(userId, education);
    res.status(201).send(profileEducation);
  };

  public patchCurrentUserEducation = async (req: Request, res: Response): Promise<void> => {
    const profileExperience = await this.patchData<PatchProfileEducationDto, ProfileEducation>(
      req,
      this.profileService.patchUserProfileEducation.bind(this.profileService),
    );
    res.status(200).send(profileExperience);
  };

  public deleteCurrentUserProfileEducation = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const educationId: string = req.params.id;
    const profileEducations = await this.profileService.deleteProfileEducationOfUser(userId, educationId);
    res.status(200).send(profileEducations);
  };

  public getGithubProfile = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.params;
    const githubProfile = await this.profileService.getGithubProfile(username);
    res.status(200).send(githubProfile);
  };

  private patchData<T, R>(
    req: Request,
    patchMethod: (userId: string, dataId: string, patchDate: T) => Promise<R>,
  ): Promise<R> {
    const userId = req.user.claims().id;
    const dataId: string = req.params.id;
    const patchData: T = req.body;
    return patchMethod(userId, dataId, patchData);
  }
}

export default ProfileController;
