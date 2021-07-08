import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import HttpException from '@exceptions/http-exception';
import { User } from '@interfaces/users';

import { userActions, authActions } from '../actions';

export interface AuthState {
  tokenExpires: number;
  refreshToken?: string;
  user?: User;
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

export const initialState: AuthState = {
  tokenExpires: 0,
  loading: false,
};

const authReducer = createReducer(initialState)
  .handleAction([authActions.login.request], (state) => ({
    ...state,
    loading: true,
  }))
  .handleAction([userActions.createUser.success, authActions.login.success], (state, action) => ({
    ...state,
    tokenExpires: action.payload.expires || 0,
    refreshToken: action.payload.refresh_token,
    user: action.payload.user,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction(authActions.login.failure, (state, action) => ({
    ...state,
    errorResponse: action.payload,
    loading: false,
  }))
  .handleAction(authActions.logout, (state) => ({
    ...state,
    tokenExpires: 0,
    refreshToken: undefined,
    user: undefined,
    errorResponse: undefined,
  }));
export default authReducer;
