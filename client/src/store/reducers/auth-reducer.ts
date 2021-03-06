import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import { userActions, authActions } from '@actions';
import { UserDto } from '@dtos/user.dto';
import HttpException from '@exceptions/http-exception';
import { AuthToken } from '@interfaces/auth-token';

export interface AuthState {
  tokenExpires: number;
  refreshToken?: string;
  user?: UserDto;
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

export const initialState: AuthState = {
  tokenExpires: 0,
  loading: false,
  ...initializeState(),
};

function initializeState(): Partial<AuthState> {
  const authTokenJson = localStorage.getItem('authToken');
  if (!authTokenJson) {
    return {};
  }
  const authToken = (JSON.parse(authTokenJson) as AuthToken);
  return {
    tokenExpires: authToken.expires,
    refreshToken: authToken.refresh_token,
    user: authToken.user,
  };
}

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
  .handleAction(userActions.updateUser.success, (state, { payload }) => ({
    ...state,
    user: payload,
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
