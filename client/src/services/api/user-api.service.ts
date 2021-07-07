import axios from 'axios';
import { Observable } from 'rxjs';

import { CreateUserDto } from '@dtos/create-user.dto';
import { User } from '@interfaces/users';

import { AxiosProxy } from './api-utils';

export class UserApiService {
  readonly axiosProxy = new AxiosProxy(axios.create({ baseURL: 'api/users' }));

  post(userData: CreateUserDto): Observable<User> {
    return this.axiosProxy.post('', userData);
  }
}
