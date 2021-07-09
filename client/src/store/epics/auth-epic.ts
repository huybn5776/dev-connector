import { AxiosResponse } from 'axios';
import * as R from 'ramda';
import { Epic } from 'redux-observable';
import { of, EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf, RootAction, RootState, Services } from 'typesafe-actions';

import { authActions, userActions } from '@actions';
import HttpException from '@exceptions/http-exception';
import { navigateTo } from '@utils/navigate-utils';

type EpicType = Epic<RootAction, RootAction, RootState, Services>;

export const login: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(authActions.login.request)),
    switchMap(({ payload: { email, password } }) =>
      api.authApi.login(email, password).pipe(
        map(authActions.login.success),
        catchError((error: AxiosResponse<HttpException>) => of(authActions.login.failure(error))),
      ),
    ),
  );

export const redirectAfterLogin: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf(authActions.login.success)),
    switchMap(() => {
      navigateTo('/dashboard');
      return EMPTY;
    }),
  );

export const saveAuthToStorage: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf([authActions.login.success, userActions.createUser.success])),
    switchMap(({ payload: authToken }) => {
      localStorage.setItem('authToken', JSON.stringify(R.omit(['access_token'], authToken)));
      return EMPTY;
    }),
  );
