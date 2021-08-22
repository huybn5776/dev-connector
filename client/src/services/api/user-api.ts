import axios from 'axios';
import { Observable } from 'rxjs';

import { CreateUserDto } from '@dtos/create-user.dto';
import { PatchUserDto } from '@dtos/patch-user.dto';
import { UserDto } from '@dtos/user.dto';
import { AuthToken } from '@interfaces/auth-token';

import { AxiosProxy } from './api-utils';

const axiosInstance = axios.create({ baseURL: '/api/users' });
const axiosProxy = new AxiosProxy(axiosInstance);

export function createUser(userData: CreateUserDto): Observable<AuthToken> {
  return axiosProxy.post('', userData);
}

export function updateUser(userData: PatchUserDto): Observable<UserDto> {
  return axiosProxy.patch('/me', userData);
}
