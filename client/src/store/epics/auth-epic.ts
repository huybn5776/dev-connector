import { AxiosResponse } from 'axios';
import * as R from 'ramda';
import { Epic } from 'redux-observable';
import { of, EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf, RootAction, RootState, Services } from 'typesafe-actions';

import { navigateTo } from '@/utils/navigate-utils';
import { authActions, userActions } from '@actions';
import HttpException from '@exceptions/http-exception';
import { AuthToken } from '@interfaces/auth-token';

type EpicType = Epic<RootAction, RootAction, RootState, Services>;

export const login: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(authActions.login.request)),
    switchMap(({ payload: { username, password } }) =>
      api.authApi.login(username, password).pipe(
        map(authActions.login.success),
        catchError((error: AxiosResponse<HttpException>) => of(authActions.login.failure(error))),
      ),
    ),
  );

export const saveAuthToStorage: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf([authActions.login.success, userActions.createUser.success])),
    switchMap(({ payload: authToken }) => {
      localStorage.setItem('authToken', JSON.stringify(R.omit(['access_token'], authToken)));
      return EMPTY;
    }),
  );

export const updateAuthUserToStorage: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf(userActions.updateUser.success)),
    switchMap(({ payload: user }) => {
      const authToken: AuthToken = JSON.parse(localStorage.getItem('authToken') || '{}');
      authToken.user = user;
      localStorage.setItem('authToken', JSON.stringify(authToken));
      return EMPTY;
    }),
  );

export const logout: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf(authActions.logout)),
    switchMap(() => {
      localStorage.removeItem('authToken');
      navigateTo('/');
      return EMPTY;
    }),
  );
