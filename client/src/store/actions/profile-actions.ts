import { AxiosResponse } from 'axios';
import { createAsyncAction, createAction } from 'typesafe-actions';

import { actionNameCreator } from '@/utils/action-utils';
import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileEducationDto } from '@dtos/patch-profile-education.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { ProfileEducationDto } from '@dtos/profile-education.dto';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';
import { ProfileDto } from '@dtos/profile.dto';
import HttpException from '@exceptions/http-exception';
import { GithubRepo } from '@interfaces/github-repo';

const stateName = 'Profile';
const { asyncActionNames, actionName } = actionNameCreator(stateName);

export const getProfiles = createAsyncAction(...asyncActionNames('Get profiles'))<
  undefined,
  ProfileDto[],
  AxiosResponse<HttpException>
>();

export const getUserProfile = createAsyncAction(...asyncActionNames('Get user profile'))<
  string,
  ProfileDto,
  AxiosResponse<HttpException>
>();

export const getCurrentProfile = createAsyncAction(...asyncActionNames('Get current profile'))<
  undefined,
  ProfileDto,
  AxiosResponse<HttpException>
>();

export const clearProfile = createAction(actionName('Clear profile'))<undefined, undefined>();

export const createProfile = createAsyncAction(...asyncActionNames('Create profile'))<
  CreateProfileDto,
  ProfileDto,
  AxiosResponse<HttpException>
>();

export const updateProfile = createAsyncAction(...asyncActionNames('Update profile'))<
  PatchProfileDto,
  ProfileDto,
  AxiosResponse<HttpException>
>();

export const addExperience = createAsyncAction(...asyncActionNames('Add experience'))<
  CreateProfileExperienceDto,
  ProfileExperienceDto,
  AxiosResponse<HttpException>
>();

export const updateExperience = createAsyncAction(...asyncActionNames('Update experience'))<
  { id: string; experience: PatchProfileExperienceDto },
  ProfileExperienceDto,
  AxiosResponse<HttpException>
>();

export const deleteExperience = createAsyncAction(...asyncActionNames('Delete experience'))<
  string,
  ProfileExperienceDto[],
  AxiosResponse<HttpException>
>();

export const addEducation = createAsyncAction(...asyncActionNames('Add education'))<
  CreateProfileEducationDto,
  ProfileEducationDto,
  AxiosResponse<HttpException>
>();

export const updateEducation = createAsyncAction(...asyncActionNames('Update education'))<
  { id: string; education: PatchProfileEducationDto },
  ProfileEducationDto,
  AxiosResponse<HttpException>
>();

export const deleteEducation = createAsyncAction(...asyncActionNames('Delete education'))<
  string,
  ProfileEducationDto[],
  AxiosResponse<HttpException>
>();

export const getGithubRepos = createAsyncAction(...asyncActionNames('Get github repos'))<
  string,
  GithubRepo[],
  AxiosResponse<HttpException>
  >();

export const clearGithubRepos = createAction(actionName('Clear github repos'))<undefined, undefined>();
