import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import { profileActions } from '@actions';
import { ProfileDto } from '@dtos/profile.dto';
import HttpException from '@exceptions/http-exception';
import { GithubRepo } from '@interfaces/github-repo';

export interface ProfileState {
  currentProfile?: ProfileDto;
  profiles: ProfileDto[];
  profilesLoaded: boolean;
  githubRepos: GithubRepo[];
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

export const initialState: ProfileState = {
  profiles: [],
  profilesLoaded: false,
  githubRepos: [],
  loading: false,
};

const profileReducer = createReducer(initialState)
  .handleAction(
    [
      profileActions.getProfiles.request,
      profileActions.getCurrentProfile.request,
      profileActions.createProfile.request,
      profileActions.updateProfile.request,
      profileActions.addExperience.request,
      profileActions.updateExperience.request,
      profileActions.deleteExperience.request,
      profileActions.getGithubRepos.request,
    ],
    (state) => ({
      ...state,
      errorResponse: undefined,
      loading: true,
    }),
  )
  .handleAction(profileActions.getProfiles.success, (state, action) => ({
    ...state,
    profiles: action.payload,
    profilesLoaded: true,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction(profileActions.getUserProfile.success, (state, { payload: profile }) => {
    let { profiles } = state;
    const targetProfileIndex = profiles.findIndex((p) => p.id === profile.id);
    if (targetProfileIndex === -1) {
      profiles = [...profiles, profile];
    } else {
      profiles = [...profiles];
      profiles[targetProfileIndex] = profile;
    }
    return {
      ...state,
      profiles,
      errorResponse: undefined,
      loading: false,
    };
  })
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
      profileActions.getGithubRepos.failure,
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
  .handleAction(profileActions.addEducation.success, (state, { payload: education }) => ({
    ...state,
    currentProfile: {
      ...state.currentProfile,
      educations: [...(state.currentProfile?.educations || []), education],
    } as ProfileDto,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction(profileActions.updateEducation.success, (state, { payload: education }) => {
    const educations = [...(state.currentProfile?.educations || [])];
    const targetEducationIndex = educations.findIndex((e) => e.id === education.id);
    if (targetEducationIndex !== -1) {
      educations[targetEducationIndex] = education;
    }

    return {
      ...state,
      currentProfile: { ...state.currentProfile, educations } as ProfileDto,
      errorResponse: undefined,
      loading: false,
    };
  })
  .handleAction(profileActions.deleteEducation.success, (state, { payload: educations }) => ({
    ...state,
    currentProfile: { ...state.currentProfile, educations } as ProfileDto,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction(profileActions.getGithubRepos.success, (state, { payload }) => ({
    ...state,
    githubRepos: payload,
    loading: false,
  }))
  .handleAction(profileActions.clearProfile, (state) => ({
    ...state,
    currentProfile: undefined,
    githubRepos: [],
    errorResponse: undefined,
  }))
  .handleAction(profileActions.clearGithubRepos, (state) => ({ ...state, githubRepos: [] }));

export default profileReducer;
