import {
  JsonController,
  Get,
  Param,
  CurrentUser,
  Authorized,
  Post,
  Body,
  Patch,
  HttpCode,
  Delete,
} from 'routing-controllers';

import { RequestUser } from '@/interfaces/request-user';
import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
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
import { GithubRepo } from '@interfaces/github-repo';
import { mapper } from '@mappers';
import ProfileService from '@services/profile.service';

@JsonController('/profile')
class ProfileController {
  readonly profileService = new ProfileService();

  @Get()
  async getAllProfiles(): Promise<ProfileDto[]> {
    const profiles = await this.profileService.getProfiles();
    return mapper.mapArray(profiles, ProfileDto, Profile);
  }

  @Get('/user/:id')
  async getProfilesWithId(@Param('id') userId: string): Promise<ProfileDto> {
    const profile = await this.profileService.getUserProfile(userId);
    return mapper.map(profile, ProfileDto, Profile);
  }

  @Get('/me')
  @Authorized()
  async getCurrentUserProfile(@CurrentUser() currentUser: RequestUser): Promise<ProfileDto> {
    const userId = currentUser.claims().id;
    const profile = await this.profileService.getUserProfile(userId);
    return mapper.map(profile, ProfileDto, Profile);
  }

  @Post('/me')
  @Authorized()
  @HttpCode(201)
  async updateCurrentUserProfile(
    @Body() profileData: CreateProfileDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ProfileDto> {
    const userId = currentUser.claims().id;
    const profile = await this.profileService.updateUserProfile(userId, profileData);
    return mapper.map(profile, ProfileDto, Profile);
  }

  @Patch('/me')
  @Authorized()
  async patchCurrentUserProfile(
    @Body() profileData: PatchProfileDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ProfileDto> {
    const userId = currentUser.claims().id;
    const profile = await this.profileService.patchUserProfile(userId, profileData);
    return mapper.map(profile, ProfileDto, Profile);
  }

  @Post('/me/experiences')
  @Authorized()
  @HttpCode(201)
  async addCurrentUserExperience(
    @Body() experienceData: CreateProfileExperienceDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ProfileExperienceDto> {
    const userId = currentUser.claims().id;
    const profileExperience = await this.profileService.addUserProfileExperience(userId, experienceData);
    return mapper.map(profileExperience, ProfileExperienceDto, ProfileExperience);
  }

  @Patch('/me/experiences/:id')
  @Authorized()
  async patchCurrentUserExperience(
    @Param('id') experienceId: string,
    @Body() experienceData: PatchProfileExperienceDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ProfileExperienceDto> {
    const userId = currentUser.claims().id;
    const profileExperience = await this.profileService.patchUserProfileExperience(
      userId,
      experienceId,
      experienceData,
    );
    return mapper.map(profileExperience, ProfileExperienceDto, ProfileExperience);
  }

  @Delete('/me/experiences/:id')
  @Authorized()
  async deleteCurrentUserProfileExperience(
    @Param('id') experienceId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ProfileExperienceDto[]> {
    const userId = currentUser.claims().id;
    const profileExperiences = await this.profileService.deleteProfileExperienceOfUser(userId, experienceId);
    return mapper.mapArray(profileExperiences, ProfileExperienceDto, ProfileExperience);
  }

  @Post('/me/educations')
  @Authorized()
  @HttpCode(201)
  async addCurrentUserEducation(
    @Body() educationData: CreateProfileEducationDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ProfileEducationDto> {
    const userId = currentUser.claims().id;
    const profileEducation = await this.profileService.addUserProfileEducation(userId, educationData);
    return mapper.map(profileEducation, ProfileEducationDto, ProfileEducation);
  }

  @Patch('/me/educations/:id')
  @Authorized()
  async patchCurrentUserEducation(
    @Param('id') educationId: string,
    @Body() educationData: PatchProfileEducationDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ProfileEducationDto> {
    const userId = currentUser.claims().id;
    const profileEducation = await this.profileService.patchUserProfileEducation(userId, educationId, educationData);
    return mapper.map(profileEducation, ProfileEducationDto, ProfileEducation);
  }

  @Delete('/me/educations/:id')
  @Authorized()
  async deleteCurrentUserProfileEducation(
    @Param('id') educationId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ProfileEducationDto[]> {
    const userId = currentUser.claims().id;
    const profileEducations = await this.profileService.deleteProfileEducationOfUser(userId, educationId);
    return mapper.mapArray(profileEducations, ProfileEducationDto, ProfileEducation);
  }

  @Get('/githubRepos/:username')
  getGithubPinnedRepos(@Param('username') username: string): Promise<GithubRepo[]> {
    return this.profileService.getGithubPinnedRepos(username);
  }
}

export default ProfileController;
