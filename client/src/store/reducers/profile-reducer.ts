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
      profileActions.addExperience.request,
      profileActions.updateExperience.request,
      profileActions.deleteExperience.request,
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
      profileActions.addExperience.failure,
      profileActions.updateExperience.failure,
      profileActions.deleteExperience.failure,
    ],
    (state, action) => ({
      ...state,
      errorResponse: action.payload,
      loading: false,
    }),
  )
  .handleAction(profileActions.addExperience.success, (state, { payload: experience }) => ({
    ...state,
    currentProfile: {
      ...state.currentProfile,
      experiences: [...(state.currentProfile?.experiences || []), experience],
    } as ProfileDto,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction(profileActions.updateExperience.success, (state, { payload: experience }) => {
    const experiences = [...(state.currentProfile?.experiences || [])];
    const targetExperienceIndex = experiences.findIndex((e) => e.id === experience.id);
    if (targetExperienceIndex !== -1) {
      experiences[targetExperienceIndex] = experience;
    }

    return {
      ...state,
      currentProfile: { ...state.currentProfile, experiences } as ProfileDto,
      errorResponse: undefined,
      loading: false,
    };
  })
  .handleAction(profileActions.deleteExperience.success, (state, { payload: experiences }) => ({
    ...state,
    currentProfile: { ...state.currentProfile, experiences } as ProfileDto,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction(profileActions.deleteEducation.success, (state, { payload: educations }) => ({
    ...state,
    currentProfile: { ...state.currentProfile, educations } as ProfileDto,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction(profileActions.clearProfile, (state) => ({
    ...state,
    currentProfile: undefined,
    repos: [],
    errorResponse: undefined,
    loading: false,
  }));

export default profileReducer;
