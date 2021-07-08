import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import HttpException from '@exceptions/http-exception';

import { userActions } from '../actions';

export interface UserState {
  errorResponse?: AxiosResponse<HttpException>;
}

export const initialState: UserState = {};

const userReducer = createReducer(initialState)
  .handleAction(userActions.createUser.success, (state ) => ({
    ...state,
    errorResponse: undefined,
  }))
  .handleAction(userActions.createUser.failure, (state, action) => ({
    ...state,
    errorResponse: action.payload,
  }));
export default userReducer;
