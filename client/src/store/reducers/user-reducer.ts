import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import { userActions } from '@actions';
import HttpException from '@exceptions/http-exception';

export interface UserState {
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

export const initialState: UserState = {
  loading: false,
};

const userReducer = createReducer(initialState)
  .handleAction([userActions.createUser.request, userActions.updateUser.request], (state) => ({
    ...state,
    loading: true,
  }))
  .handleAction([userActions.createUser.success, userActions.updateUser.success], (state) => ({
    ...state,
    errorResponse: undefined,
    loading: false,
  }))
  .handleAction([userActions.createUser.failure, userActions.updateUser.failure], (state, action) => ({
    ...state,
    errorResponse: action.payload,
    loading: false,
  }));
export default userReducer;
