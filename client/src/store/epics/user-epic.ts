import { AxiosResponse } from 'axios';
import { Epic } from 'redux-observable';
import { of, EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf, RootAction, RootState, Services } from 'typesafe-actions';

import HttpException from '@exceptions/http-exception';
import { navigateTo } from '@utils/navigate-utils';

import { userActions } from '../actions';

type EpicType = Epic<RootAction, RootAction, RootState, Services>;

export const createUser: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(userActions.createUser.request)),
    switchMap(({payload}) =>
      api.userApi.createUser(payload).pipe(
        map(userActions.createUser.success),
        catchError((error: AxiosResponse<HttpException>) => of(userActions.createUser.failure(error))),
      ),
    ),
  );

export const redirectAfterCreateUser: EpicType = (action$) =>
  action$.pipe(
    filter(isActionOf(userActions.createUser.success)),
    switchMap(() => {
      navigateTo('/dashboard');
      return EMPTY;
    }),
  );
