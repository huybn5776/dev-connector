import { AxiosResponse } from 'axios';
import { createAsyncAction, createAction } from 'typesafe-actions';

import HttpException from '@exceptions/http-exception';
import { AuthToken } from '@interfaces/auth-token';
import { actionNameCreator } from '@utils/action-utils';

const stateName = 'Auth';
const { actionName, asyncActionNames } = actionNameCreator(stateName);

export const login = createAsyncAction(...asyncActionNames('Login'))<
  { username: string; password: string },
  AuthToken,
  AxiosResponse<HttpException>
>();
export const logout = createAction(actionName('Logout'))<undefined, undefined>();
