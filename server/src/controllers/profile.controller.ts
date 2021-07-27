import { Request, Response } from 'express';

import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileEducationDto } from '@dtos/patch-profile-education.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { ProfileEducationDto } from '@dtos/profile-education.dto';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';
import { ProfileDto } from '@dtos/profile.dto';
import { Profile } from '@entities/profile';
import { ProfileEducation } from '@entities/profile-education';
import { ProfileExperience } from '@entities/profile-experience';
import { mapper } from '@mappers';
import ProfileService from '@services/profile.service';

class ProfileController {
  readonly profileService = new ProfileService();

  public getAllProfiles = async (req: Request, res: Response): Promise<void> => {
    const profiles = await this.profileService.getProfiles();
    const profileDtoList = mapper.mapArray(profiles, ProfileDto, Profile);
    res.status(200).send(profileDtoList);
  };

  public getProfilesWithId = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const profile = await this.profileService.getUserProfile(userId);
    const profileDto = mapper.map(profile, ProfileDto, Profile);
    res.status(200).send(profileDto);
  };

  public getCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const profile = await this.profileService.getUserProfile(userId);
    const profileDto = mapper.map(profile, ProfileDto, Profile);
    res.status(200).send(profileDto);
  };

  public updateCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const profileData: CreateProfileDto = req.body;
    const profile = await this.profileService.updateUserProfile(userId, profileData);
    const profileDto = mapper.map(profile, ProfileDto, Profile);
    res.status(200).send(profileDto);
  };

  public patchCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const profileData: PatchProfileDto = req.body;
    const profile = await this.profileService.patchUserProfile(userId, profileData);
    const profileDto = mapper.map(profile, ProfileDto, Profile);
    res.status(200).send(profileDto);
  };

  public addCurrentUserExperience = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const experienceData: CreateProfileExperienceDto = req.body;
    const profileExperience = await this.profileService.addUserProfileExperience(userId, experienceData);
    const experienceDto = mapper.map(profileExperience, ProfileExperienceDto, ProfileExperience);
    res.status(201).send(experienceDto);
  };

  public patchCurrentUserExperience = async (req: Request, res: Response): Promise<void> => {
    const profileExperience = await this.patchData<PatchProfileExperienceDto, ProfileExperience>(
      req,
      this.profileService.patchUserProfileExperience.bind(this.profileService),
    );
    const experienceDto = mapper.map(profileExperience, ProfileExperienceDto, ProfileExperience);
    res.status(200).send(experienceDto);
  };

  public deleteCurrentUserProfileExperience = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const experienceId: string = req.params.id;
    const profileExperiences = await this.profileService.deleteProfileExperienceOfUser(userId, experienceId);
    const experienceDtoList = mapper.mapArray(profileExperiences, ProfileExperienceDto, ProfileExperience);
    res.status(200).send(experienceDtoList);
  };

  public addCurrentUserEducation = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const education = req.body;
    const profileEducation = await this.profileService.addUserProfileEducation(userId, education);
    const experienceDto = mapper.map(profileEducation, ProfileEducationDto, ProfileEducation);
    res.status(201).send(experienceDto);
  };

  public patchCurrentUserEducation = async (req: Request, res: Response): Promise<void> => {
    const profileEducation = await this.patchData<PatchProfileEducationDto, ProfileEducation>(
      req,
      this.profileService.patchUserProfileEducation.bind(this.profileService),
    );
    const experienceDto = mapper.map(profileEducation, ProfileEducationDto, ProfileEducation);
    res.status(200).send(experienceDto);
  };

  public deleteCurrentUserProfileEducation = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const educationId: string = req.params.id;
    const profileEducations = await this.profileService.deleteProfileEducationOfUser(userId, educationId);
    const experienceDtoList = mapper.mapArray(profileEducations, ProfileEducationDto, ProfileEducation);
    res.status(200).send(experienceDtoList);
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
