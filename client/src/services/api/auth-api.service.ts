import axios from 'axios';
import { Observable } from 'rxjs';

import { AuthRequest } from '@dtos/auth-request';
import { AuthToken } from '@interfaces/auth-token';

import { AxiosProxy } from './api-utils';

export class AuthApiService {
  readonly axiosProxy = new AxiosProxy(axios.create({ baseURL: 'api/oauth' }));

  login(email: string, password: string): Observable<AuthToken> {
    return this.axiosProxy.post<AuthToken, AuthRequest>('token', { grant_type: 'password', username: email, password });
  }
}
