import axios, { AxiosResponse } from 'axios';
import config from 'config';
import { Document } from 'mongoose';

import {
  updateProfileFromDto,
  mapCreateExperienceDtoToExperience,
  mapCreateEducationDtoToEducation,
} from '@/mappers/profile-mapper';
import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import HttpException from '@exceptions/http-exception';
import { Profile } from '@interfaces/profile';
import { ProfileEducation } from '@interfaces/profile-education';
import { ProfileExperience } from '@interfaces/profile-experience';
import { ProfileModel, ProfileDocument } from '@models/profile.model';
import { UserModel } from '@models/user.model';

class ProfileService {
  readonly profiles = ProfileModel;

  getProfiles(): Promise<Profile[]> {
    return this.profiles.find().populate('user', ['name', 'avatar']).exec();
  }

  async getUserProfile(userId: string): Promise<Profile> {
    const profile: ProfileDocument | null = await this.profiles
      .findOne({ user: new UserModel({ _id: userId }) })
      .populate('user', ['name', 'avatar']);
    if (!profile) {
      throw new HttpException(404);
    }
    return profile;
  }

  async patchUserProfile(userId: string, profileData: CreateProfileDto): Promise<Profile> {
    const profile: (Profile & Document) | null =
      (await this.profiles.findOne({ user: new UserModel({ _id: userId }) })) ?? new ProfileModel({ user: userId });

    updateProfileFromDto(profileData, profile);

    await profile.save();
    return profile;
  }

  async deleteProfileOfUser(userId: string): Promise<void> {
    await this.profiles.findOneAndDelete({ user: new UserModel({ _id: userId }) });
  }

  async addUserProfileExperience(
    userId: string,
    experienceData: CreateProfileExperienceDto,
  ): Promise<ProfileExperience> {
    const profile: ProfileDocument | null = await this.profiles.findOne({ user: new UserModel({ _id: userId }) });
    if (!profile) {
      throw new HttpException(404);
    }

    const profileExperience = mapCreateExperienceDtoToExperience(experienceData);
    profile.experiences.unshift(profileExperience);

    await profile.save();
    return profile.experiences[0];
  }

  async deleteProfileExperienceOfUser(userId: string, experienceId: string): Promise<ProfileExperience[]> {
    const profile: ProfileDocument | null = await this.profiles.findOneAndUpdate(
      { user: new UserModel({ _id: userId }) },
      { $pull: { experiences: { _id: experienceId } } },
    );

    const deletedExperience = profile?.experiences.some((experience) => `${experience._id}` === experienceId);
    if (!deletedExperience) {
      throw new HttpException(404);
    }

    return profile?.experiences.filter((experience) => `${experience._id}` !== experienceId) || [];
  }

  async addUserProfileEducation(userId: string, educationData: CreateProfileEducationDto): Promise<ProfileEducation> {
    const profile: ProfileDocument | null = await this.profiles.findOne({ user: new UserModel({ _id: userId }) });
    if (!profile) {
      throw new HttpException(404);
    }

    const profileEducation = mapCreateEducationDtoToEducation(educationData);
    profile.educations.unshift(profileEducation);

    await profile.save();
    return profile.educations[0];
  }

  async deleteProfileEducationOfUser(userId: string, educationId: string): Promise<ProfileEducation[]> {
    const profile: ProfileDocument | null = await this.profiles.findOneAndUpdate(
      { user: new UserModel({ _id: userId }) },
      { $pull: { educations: { _id: educationId } } },
    );

    const deletedEducation = profile?.educations.some((education) => `${education._id}` === educationId);
    if (!profile || !deletedEducation) {
      throw new HttpException(404);
    }

    return profile.educations.filter((education) => `${education._id}` !== educationId);
  }

  async getGithubProfile(username: string): Promise<unknown> {
    const githubClientId: string = config.get('githubClientId');
    const githubSecret: string = config.get('githubSecret');
    const githubProfile = await axios
      .get(`https://api.github.com/users/${username}/repos`, {
        params: {
          per_page: 5,
          sort: 'created:asc',
          client_id: githubClientId,
          client_secret: githubSecret,
        },
        headers: { 'user-agent': 'node.js' },
      })
      .then((response) => response.data)
      .catch((error) => {
        const { status } = error.response as AxiosResponse;
        if (status === 404) {
          return null;
        }
        throw error;
      });
    if (!githubProfile) {
      throw new HttpException(404);
    }

    return githubProfile;
  }
}

export default ProfileService;
