import { AxiosResponse } from 'axios';
import { createAsyncAction } from 'typesafe-actions';

import { CreateUserDto } from '@dtos/create-user.dto';
import HttpException from '@exceptions/http-exception';
import { AuthToken } from '@interfaces/auth-token';
import { actionNameCreator } from '@utils/action-utils';

const stateName = 'User';
const { asyncActionNames } = actionNameCreator(stateName);

export const createUser = createAsyncAction(...asyncActionNames('Create user'))<
  CreateUserDto,
  AuthToken,
  AxiosResponse<HttpException>
>();
