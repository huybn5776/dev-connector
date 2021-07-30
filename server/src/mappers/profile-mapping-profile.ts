import { ignore, fromValue, mapWith } from '@automapper/core';
import type { MappingProfile, Mapper } from '@automapper/types';

import { mapId } from '@/utils/mapper-utils';
import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileEducationDto } from '@dtos/patch-profile-education.dto';
import { PatchProfileExperienceDto } from '@dtos/patch-profile-experience.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { ProfileEducationDto } from '@dtos/profile-education.dto';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';
import { ProfileSocialDto } from '@dtos/profile-social.dto';
import { ProfileDto } from '@dtos/profile.dto';
import { Profile } from '@entities/profile';
import { ProfileEducation } from '@entities/profile-education';
import { ProfileExperience } from '@entities/profile-experience';
import { ProfileSocial } from '@entities/profile-social';
import { isNestedEmpty } from '@utils/object-utils';

export const profileMappingProfile: MappingProfile = (mapper: Mapper) => {
  mapper
    .createMap(Profile, ProfileDto)
    .forMember(...mapId())
    .forMember(
      (destination) => destination.social,
      mapWith(
        () => ProfileSocialDto,
        (source) => (isNestedEmpty(source.social) ? undefined : source.social),
        () => ProfileSocial,
      ),
    );

  mapper.createMap(ProfileExperience, ProfileExperienceDto).forMember(...mapId());
  mapper.createMap(ProfileEducation, ProfileEducationDto).forMember(...mapId());
  mapper.createMap(ProfileSocial, ProfileSocialDto);

  mapper
    .createMap(CreateProfileDto, Profile)
    .forMember((source) => source._id, ignore())
    .forMember((source) => source.createdAt, ignore())
    .forMember((source) => source.updatedAt, ignore())
    .forMember((source) => source.user, ignore())
    .forMember((source) => source.experiences, fromValue([]))
    .forMember((source) => source.educations, fromValue([]));
  mapper.createMap(CreateProfileExperienceDto, ProfileExperience);
  mapper.createMap(CreateProfileEducationDto, ProfileEducation);
  mapper
    .createMap(PatchProfileDto, Profile)
    .forMember((source) => source.user, ignore())
    .forMember((source) => source.experiences, ignore())
    .forMember((source) => source.educations, ignore());
  mapper.createMap(PatchProfileExperienceDto, ProfileExperience);
  mapper.createMap(PatchProfileEducationDto, ProfileEducation);
  mapper.createMap(ProfileSocial, ProfileSocial);
};
