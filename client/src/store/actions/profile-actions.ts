import { AxiosResponse } from 'axios';
import { createAsyncAction, createAction } from 'typesafe-actions';

import { actionNameCreator } from '@/utils/action-utils';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { ProfileDto } from '@dtos/profile.dto';
import HttpException from '@exceptions/http-exception';

const stateName = 'Profile';
const { asyncActionNames, actionName } = actionNameCreator(stateName);

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
