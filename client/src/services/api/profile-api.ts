import axios from 'axios';
import { Observable } from 'rxjs';

import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileEducationDto } from '@dtos/patch-profile-education.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { ProfileEducationDto } from '@dtos/profile-education.dto';
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

export function addEducation(educationData: CreateProfileEducationDto): Observable<ProfileEducationDto> {
  return axiosProxy.post('/me/educations', educationData);
}

export function patchEducation(id: string, educationData: PatchProfileEducationDto): Observable<ProfileEducationDto> {
  return axiosProxy.patch(`/me/educations/${id}`, educationData);
}

export function deleteEducation(id: string): Observable<ProfileEducationDto[]> {
  return axiosProxy.delete(`/me/educations/${id}`);
}
