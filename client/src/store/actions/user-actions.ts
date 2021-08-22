import { AxiosResponse } from 'axios';
import { createAsyncAction } from 'typesafe-actions';

import { actionNameCreator } from '@/utils/action-utils';
import { CreateUserDto } from '@dtos/create-user.dto';
import { PatchUserDto } from '@dtos/patch-user.dto';
import { UserDto } from '@dtos/user.dto';
import HttpException from '@exceptions/http-exception';
import { AuthToken } from '@interfaces/auth-token';

const stateName = 'User';
const { asyncActionNames } = actionNameCreator(stateName);

export const createUser = createAsyncAction(...asyncActionNames('Create user'))<
  CreateUserDto,
  AuthToken,
  AxiosResponse<HttpException>
>();

export const updateUser = createAsyncAction(...asyncActionNames('Update user'))<
  PatchUserDto,
  UserDto,
  AxiosResponse<HttpException>
>();
