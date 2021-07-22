import { classes } from '@automapper/classes';
import { createMapper, ignore } from '@automapper/core';

import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileEducationDto } from '@dtos/patch-profile-education.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { Profile } from '@interfaces/profile';
import { ProfileEducation } from '@interfaces/profile-education';
import { ProfileExperience } from '@interfaces/profile-experience';
import { ProfileSocial } from '@interfaces/profile-social';

export const mapper = createMapper({
  name: 'profileMapper',
  pluginInitializer: classes,
});
mapper.createMap(CreateProfileDto, Profile)
  .forMember(source => source.user, ignore())
  .forMember(source => source.experiences, ignore())
  .forMember(source => source.educations, ignore());
mapper.createMap(CreateProfileExperienceDto, ProfileExperience);
mapper.createMap(CreateProfileEducationDto, ProfileEducation);
mapper.createMap(ProfileSocial, ProfileSocial);

mapper.createMap(PatchProfileExperienceDto, ProfileExperience);
mapper.createMap(PatchProfileEducationDto, ProfileEducation);

export function updateProfileFromDto(profileData: Partial<CreateProfileDto>, profile: Profile): void {
  mapper.map(profileData, Profile, CreateProfileDto, profile);
}

export function mapCreateExperienceDtoToExperience(experienceData: CreateProfileExperienceDto): ProfileExperience {
  return mapper.map(experienceData, ProfileExperience, CreateProfileExperienceDto);
}

export function mapCreateEducationDtoToEducation(educationData: CreateProfileEducationDto): ProfileEducation {
  return mapper.map(educationData, ProfileEducation, CreateProfileEducationDto);
}

export function updateExperienceFromDto(profileData: Partial<PatchProfileExperienceDto>, experience: ProfileExperience): void {
  mapper.map(profileData, ProfileExperience, PatchProfileExperienceDto, experience);
}

export function updateEducationFromDto(profileData: Partial<PatchProfileEducationDto>, experience: ProfileEducation): void {
  mapper.map(profileData, ProfileEducation, PatchProfileEducationDto, experience);
}
