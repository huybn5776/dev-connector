import { AxiosResponse } from 'axios';
import { createAsyncAction, createAction } from 'typesafe-actions';

import { CreateProfileDto } from '@dtos/create-profile.dto';
import HttpException from '@exceptions/http-exception';
import { Profile } from '@interfaces/profile';
import { actionNameCreator } from '@utils/action-utils';

const stateName = 'Profile';
const { asyncActionNames, actionName } = actionNameCreator(stateName);

export const getCurrentProfile = createAsyncAction(...asyncActionNames('Get current profile'))<
  undefined,
  Profile,
  AxiosResponse<HttpException>
>();

export const clearProfile = createAction(actionName('Clear profile'))<undefined, undefined>();

export const createProfile = createAsyncAction(...asyncActionNames('Create profile'))<
  CreateProfileDto,
  Profile,
  AxiosResponse<HttpException>
>();
