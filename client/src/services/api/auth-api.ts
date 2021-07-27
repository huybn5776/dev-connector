import axios from 'axios';
import { Observable } from 'rxjs';

import { AuthRequest } from '@dtos/auth-request';
import { AuthToken } from '@interfaces/auth-token';

import { AxiosProxy } from './api-utils';

const axiosInstance = axios.create({ baseURL: '/api/oauth' });
const axiosProxy = new AxiosProxy(axiosInstance);

export function login(username: string, password: string): Observable<AuthToken> {
  return axiosProxy.post<AuthToken, AuthRequest>('token', { grant_type: 'password', username, password });
}
