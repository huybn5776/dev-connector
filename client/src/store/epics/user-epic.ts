import { AxiosResponse } from 'axios';
import { Epic } from 'redux-observable';
import { of, EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf, RootAction, RootState, Services } from 'typesafe-actions';

import { navigateTo } from '@/utils/navigate-utils';
import { userActions } from '@actions';
import HttpException from '@exceptions/http-exception';

type EpicType = Epic<RootAction, RootAction, RootState, Services>;

export const createUser: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(userActions.createUser.request)),
    switchMap(({ payload }) =>
      api.userApi.createUser(payload).pipe(
        map(userActions.createUser.success),
        catchError((error: AxiosResponse<HttpException>) => of(userActions.createUser.failure(error))),
      ),
    ),
  );

export const updateUser: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(userActions.updateUser.request)),
    switchMap(({ payload }) =>
      api.userApi.updateUser(payload).pipe(
        map(userActions.updateUser.success),
        catchError((error: AxiosResponse<HttpException>) => of(userActions.updateUser.failure(error))),
      ),
    ),
  );

export const redirectAfterSaveUser: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf([userActions.createUser.success, userActions.updateUser.success])),
    switchMap(() => {
      navigateTo('/dashboard');
      return EMPTY;
    }),
  );
