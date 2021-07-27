import axios from 'axios';
import { Observable } from 'rxjs';

import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { ProfileDto } from '@dtos/profile.dto';

import { AxiosProxy } from './api-utils';

const axiosInstance = axios.create({ baseURL: '/api/profile' });
const axiosProxy = new AxiosProxy(axiosInstance);

export function getCurrentProfile(): Observable<ProfileDto> {
  return axiosProxy.get('/me');
}

export function updateProfile(profileData: CreateProfileDto): Observable<ProfileDto> {
  return axiosProxy.post('/me', profileData);
}

export function patchProfile(profileData: PatchProfileDto): Observable<ProfileDto> {
  return axiosProxy.patch('/me', profileData);
}
