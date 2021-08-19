import axios, { AxiosResponse } from 'axios';
import config from 'config';
import { Document } from 'mongoose';
import * as R from 'ramda';

import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { Profile } from '@entities/profile';
import { ProfileEducation } from '@entities/profile-education';
import { ProfileExperience } from '@entities/profile-experience';
import HttpException from '@exceptions/http-exception';
import { GithubRepo } from '@interfaces/github-repo';
import { mapper } from '@mappers';
import { ProfileModel, ProfileDocument } from '@models/profile.model';
import { UserModel } from '@models/user.model';

class ProfileService {
  readonly profiles = ProfileModel;

  async getProfiles(): Promise<Profile[]> {
    const profileDocuments = await this.profiles
      .find()
      .populate('user', ['name', 'avatar'])
      .select('-experiences -educations')
      .exec();
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
    const profile = R.pipe(
      () => mapper.map(profileData, Profile, CreateProfileDto),
      R.mergeLeft({ user }),
      R.omit(['_id', 'createdAt', 'updatedAt']),
    )() as ProfileDocument;
    const profileDocument = await this.profiles
      .findOneAndUpdate({ user }, profile, { new: true, upsert: true })
      .populate('user');
    return profileDocument.toObject();
  }

  async patchUserProfile(userId: string, profileData: PatchProfileDto): Promise<Profile> {
    const profile: (Profile & Document) | null = await this.profiles
      .findOne({ user: new UserModel({ _id: userId }) })
      .populate('user');
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

  async getGithubPinnedRepos(username: string): Promise<GithubRepo[]> {
    const githubToken: string = config.get('githubToken');
    const githubRepos = await axios
      .post(
        'https://api.github.com/graphql',
        {
          query: `
query {
  user(login: "${username}") {
		pinnedItems(first: 10, types: [REPOSITORY]) {
			totalCount
			edges {
				node {
					... on Repository {
						name
						description
						owner {
							login
						}
						stargazerCount
						forkCount
						watchers {
							totalCount
						}
					}
				}
			}
		}
	}
}
`,
        },
        { headers: { Authorization: `Bearer ${githubToken}` } },
      )
      .then((response) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return response.data.data.user.pinnedItems.edges.map((edge: any) => ({
          name: edge.node.name,
          description: edge.node.description,
          owner: edge.node.owner.login,
          stargazerCount: edge.node.stargazerCount,
          forkCount: edge.node.forkCount,
          watcherCount: edge.node.watchers.totalCount,
        }));
      })
      .catch((error) => {
        const { status } = error.response as AxiosResponse;
        if (status === 404) {
          return null;
        }
        throw error;
      });
    if (!githubRepos) {
      throw new HttpException(404);
    }

    return githubRepos;
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
