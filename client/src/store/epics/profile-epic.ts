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

export const redirectAfterCreateOrEditProfile: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf([profileActions.createProfile.success, profileActions.updateProfile.success])),
    switchMap(() => {
      navigateTo('/dashboard');
      return EMPTY;
    }),
  );
