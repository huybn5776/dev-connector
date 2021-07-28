import axios from 'axios';
import { Observable } from 'rxjs';

import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';
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

export function addExperience(experienceData: CreateProfileExperienceDto): Observable<ProfileExperienceDto> {
  return axiosProxy.post('/me/experiences', experienceData);
}

export function patchExperience(
  id: string,
  experienceData: PatchProfileExperienceDto,
): Observable<ProfileExperienceDto> {
  return axiosProxy.patch(`/me/experiences/${id}`, experienceData);
}

export function deleteExperience(id: string): Observable<ProfileExperienceDto[]> {
  return axiosProxy.delete(`/me/experiences/${id}`);
}
