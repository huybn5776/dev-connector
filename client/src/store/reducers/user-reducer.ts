import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import HttpException from '@exceptions/http-exception';

import { userActions } from '../actions';

export interface UserState {
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

export const initialState: UserState = {
  loading: false,
};

const userReducer = createReducer(initialState)
  .handleAction([userActions.createUser.request], (state) => ({
    ...state,
    loading: true,
  }))
  .handleAction(userActions.createUser.success, (state) => ({
    ...state,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction(userActions.createUser.failure, (state, action) => ({
    ...state,
    errorResponse: action.payload,
    loading: false,
  }));
export default userReducer;
