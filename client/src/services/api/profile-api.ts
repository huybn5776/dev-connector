import axios from 'axios';
import { Observable } from 'rxjs';

import { CreateProfileDto } from '@dtos/create-profile.dto';
import { Profile } from '@interfaces/profile';

import { AxiosProxy } from './api-utils';

const axiosInstance = axios.create({ baseURL: 'api/profile' });
const axiosProxy = new AxiosProxy(axiosInstance);

export function getCurrentProfile(): Observable<Profile> {
  return axiosProxy.get('/me');
}

export function patchProfile(profileData: CreateProfileDto): Observable<Profile> {
  return axiosProxy.patch('/me', profileData);
}
