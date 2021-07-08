import { AxiosResponse } from 'axios';
import { Epic } from 'redux-observable';
import { of, EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf, RootAction, RootState, Services } from 'typesafe-actions';

import HttpException from '@exceptions/http-exception';
import { navigateTo } from '@utils/navigate-utils';

import { authActions } from '../actions';

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
      navigateTo('/');
      return EMPTY;
    }),
  );
