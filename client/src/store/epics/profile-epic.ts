import { AxiosResponse } from 'axios';
import { Epic } from 'redux-observable';
import { of, EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf, RootAction, RootState, Services } from 'typesafe-actions';

import { navigateTo } from '@/utils/navigate-utils';
import { profileActions, authActions } from '@actions';
import HttpException from '@exceptions/http-exception';

type EpicType = Epic<RootAction, RootAction, RootState, Services>;

export const getCurrentProfile: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.getCurrentProfile.request)),
    switchMap(() =>
      api.profileApi.getCurrentProfile().pipe(
        map(profileActions.getCurrentProfile.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.getCurrentProfile.failure(error))),
      ),
    ),
  );

export const clearProfileAfterLogout: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf(authActions.logout)),
    map(() => profileActions.clearProfile()),
  );

export const createProfile: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.createProfile.request)),
    switchMap(({ payload }) =>
      api.profileApi.updateProfile(payload).pipe(
        map(profileActions.createProfile.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.createProfile.failure(error))),
      ),
    ),
  );

export const updateProfile: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.updateProfile.request)),
    switchMap(({ payload }) =>
      api.profileApi.patchProfile(payload).pipe(
        map(profileActions.updateProfile.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.updateProfile.failure(error))),
      ),
    ),
  );

export const redirectAfterCreateOrEdit: EpicType = (action$) =>
  action$.pipe(
    filter(
      isActionOf([
        profileActions.createProfile.success,
        profileActions.updateProfile.success,
        profileActions.addExperience.success,
        profileActions.updateExperience.success,
        profileActions.addEducation.success,
        profileActions.updateEducation.success,
      ]),
    ),
    switchMap(() => {
      navigateTo('/dashboard');
      return EMPTY;
    }),
  );

export const addExperience: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.addExperience.request)),
    switchMap(({ payload }) =>
      api.profileApi.addExperience(payload).pipe(
        map(profileActions.addExperience.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.addExperience.failure(error))),
      ),
    ),
  );

export const updateExperience: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.updateExperience.request)),
    switchMap(({ payload: { id, experience } }) =>
      api.profileApi.patchExperience(id, experience).pipe(
        map(profileActions.updateExperience.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.updateExperience.failure(error))),
      ),
    ),
  );

export const deleteExperience: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.deleteExperience.request)),
    switchMap(({ payload: id }) =>
      api.profileApi.deleteExperience(id).pipe(
        map(profileActions.deleteExperience.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.deleteExperience.failure(error))),
      ),
    ),
  );

export const addEducation: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.addEducation.request)),
    switchMap(({ payload }) =>
      api.profileApi.addEducation(payload).pipe(
        map(profileActions.addEducation.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.addEducation.failure(error))),
      ),
    ),
  );

export const updateEducation: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.updateEducation.request)),
    switchMap(({ payload: { id, education } }) =>
      api.profileApi.patchEducation(id, education).pipe(
        map(profileActions.updateEducation.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.updateEducation.failure(error))),
      ),
    ),
  );

export const deleteEducation: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(profileActions.deleteEducation.request)),
    switchMap(({ payload: id }) =>
      api.profileApi.deleteEducation(id).pipe(
        map(profileActions.deleteEducation.success),
        catchError((error: AxiosResponse<HttpException>) => of(profileActions.deleteEducation.failure(error))),
      ),
    ),
  );
