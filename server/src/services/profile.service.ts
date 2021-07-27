import axios, { AxiosResponse } from 'axios';
import config from 'config';
import { Document } from 'mongoose';

import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { Profile } from '@entities/profile';
import { ProfileEducation } from '@entities/profile-education';
import { ProfileExperience } from '@entities/profile-experience';
import HttpException from '@exceptions/http-exception';
import { mapper } from '@mappers';
import { ProfileModel, ProfileDocument } from '@models/profile.model';
import { UserModel } from '@models/user.model';

class ProfileService {
  readonly profiles = ProfileModel;

  async getProfiles(): Promise<Profile[]> {
    const profileDocuments = await this.profiles.find().populate('user', ['name', 'avatar']).exec();
    return profileDocuments.map((profile) => profile.toObject() as Profile);
  }

  async getUserProfile(userId: string): Promise<Profile> {
    const profile: ProfileDocument | null = await this.profiles
      .findOne({ user: new UserModel({ _id: userId }) })
      .populate('user', ['name', 'avatar']);
    if (!profile) {
      throw new HttpException(404);
    }
    return profile.toObject();
  }

  async updateUserProfile(userId: string, profileData: CreateProfileDto): Promise<Profile> {
    const user = new UserModel({ _id: userId });
    const profile = { ...mapper.map(profileData, Profile, CreateProfileDto), user } as ProfileDocument;
    await this.profiles.findOneAndUpdate({ user }, profile, { new: true, upsert: true });
    return profile.toObject();
  }

  async patchUserProfile(userId: string, profileData: PatchProfileDto): Promise<Profile> {
    const profile: (Profile & Document) | null = await this.profiles.findOne({ user: new UserModel({ _id: userId }) });
    if (!profile) {
      throw new HttpException(404);
    }
    mapper.map(profileData, Profile, PatchProfileDto, profile);
    await profile.save();
    return profile.toObject();
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

    const profileExperience = mapper.map(experienceData, ProfileExperience, CreateProfileExperienceDto);
    profile.experiences.unshift(profileExperience);

    await profile.save();
    return profile.toObject().experiences[0];
  }

  async patchUserProfileExperience(
    userId: string,
    experienceId: string,
    experienceData: Partial<CreateProfileExperienceDto>,
  ): Promise<ProfileExperience> {
    const profile = await this.findUserProfile(userId);
    const experience = (profile.experiences as (ProfileExperience & Document)[]).find(
      (e) => `${e._id}` === `${experienceId}`,
    );
    if (!experience) {
      throw new HttpException(404);
    }

    mapper.map(experienceData, ProfileExperience, CreateProfileExperienceDto, experience);

    await profile.save();
    return experience.toObject();
  }

  async deleteProfileExperienceOfUser(userId: string, experienceId: string): Promise<ProfileExperience[]> {
    const profile: ProfileDocument | null = await this.profiles.findOneAndUpdate(
      { user: new UserModel({ _id: userId }) },
      { $pull: { experiences: { _id: experienceId } } },
    );

    const deletedExperience = profile?.experiences.some((experience) => `${experience._id}` === experienceId);
    if (!profile || !deletedExperience) {
      throw new HttpException(404);
    }

    return profile.toObject().experiences.filter((experience) => `${experience._id}` !== experienceId);
  }

  async addUserProfileEducation(userId: string, educationData: CreateProfileEducationDto): Promise<ProfileEducation> {
    const profile: ProfileDocument | null = await this.profiles.findOne({ user: new UserModel({ _id: userId }) });
    if (!profile) {
      throw new HttpException(404);
    }

    const profileEducation = mapper.map(educationData, ProfileEducation, CreateProfileEducationDto);
    profile.educations.unshift(profileEducation);

    await profile.save();
    return profile.toObject().educations[0];
  }

  async patchUserProfileEducation(
    userId: string,
    educationId: string,
    educationData: Partial<CreateProfileEducationDto>,
  ): Promise<ProfileEducation> {
    const profile = await this.findUserProfile(userId);
    const education = (profile.educations as (ProfileEducation & Document)[]).find(
      (e) => `${e._id}` === `${educationId}`,
    );
    if (!education) {
      throw new HttpException(404);
    }

    mapper.map(educationData, ProfileEducation, CreateProfileEducationDto, education);

    await profile.save();
    return education.toObject();
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

    return profile.toObject().educations.filter((education) => `${education._id}` !== educationId);
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

  private async findUserProfile(userId: string): Promise<ProfileDocument> {
    const profile: ProfileDocument | null = await this.profiles.findOne({ user: new UserModel({ _id: userId }) });
    if (!profile) {
      throw new HttpException(404);
    }
    return profile;
  }
}

export default ProfileService;
