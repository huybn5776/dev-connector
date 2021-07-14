import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import { profileActions } from '@actions';
import HttpException from '@exceptions/http-exception';
import { Profile } from '@interfaces/profile';

export interface ProfileState {
  currentProfile?: Profile;
  profiles: Profile[];
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
  .handleAction([profileActions.getCurrentProfile.request, profileActions.createProfile.request], (state) => ({
    ...state,
    errorResponse: undefined,
    loading: true,
  }))
  .handleAction([profileActions.getCurrentProfile.success, profileActions.createProfile.success], (state, action) => ({
    ...state,
    currentProfile: action.payload,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction([profileActions.getCurrentProfile.failure, profileActions.createProfile.failure], (state, action) => ({
    ...state,
    errorResponse: action.payload,
    loading: true,
  }))
  .handleAction(profileActions.clearProfile, (state) => ({
    ...state,
    currentProfile: undefined,
    repos: [],
    errorResponse: undefined,
    loading: false,
  }));

export default profileReducer;
