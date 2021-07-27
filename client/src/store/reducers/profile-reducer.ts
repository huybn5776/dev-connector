import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import { profileActions } from '@actions';
import { ProfileDto } from '@dtos/profile.dto';
import HttpException from '@exceptions/http-exception';

export interface ProfileState {
  currentProfile?: ProfileDto;
  profiles: ProfileDto[];
  repos: string[];
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

export const initialState: ProfileState = {
  profiles: [],
  repos: [],
  loading: false,
};

const profileReducer = createReducer(initialState)
  .handleAction(
    [
      profileActions.getCurrentProfile.request,
      profileActions.createProfile.request,
      profileActions.updateProfile.request,
    ],
    (state) => ({
      ...state,
      errorResponse: undefined,
      loading: true,
    }),
  )
  .handleAction(
    [
      profileActions.getCurrentProfile.success,
      profileActions.createProfile.success,
      profileActions.updateProfile.success,
    ],
    (state, action) => ({
      ...state,
      currentProfile: action.payload,
      errorResponse: undefined,
      loading: false,
    }),
  )
  .handleAction(
    [
      profileActions.getCurrentProfile.failure,
      profileActions.createProfile.failure,
    ],
    (state, action) => ({
      ...state,
      errorResponse: action.payload,
      loading: false,
    }),
  )
  .handleAction(profileActions.clearProfile, (state) => ({
    ...state,
    currentProfile: undefined,
    repos: [],
    errorResponse: undefined,
    loading: false,
  }));

export default profileReducer;
