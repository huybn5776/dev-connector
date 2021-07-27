import { AutoMap } from '@automapper/classes';

import { ProfileEducationDto } from '@dtos/profile-education.dto';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';
import { ProfileSocialDto } from '@dtos/profile-social.dto';
import { UserDto } from '@dtos/user.dto';

export class ProfileDto {
  id!: string;

  @AutoMap()
  user!: UserDto;

  @AutoMap()
  company?: string;
  @AutoMap()
  website?: string;
  @AutoMap()
  location?: string;
  @AutoMap()
  status!: string;
  @AutoMap()
  skills!: string[];
  @AutoMap()
  bio?: string;
  @AutoMap()
  githubUsername?: string;

  @AutoMap({ typeFn: () => ProfileExperienceDto })
  experiences!: ProfileExperienceDto[];
  @AutoMap({ typeFn: () => ProfileEducationDto })
  educations!: ProfileEducationDto[];
  @AutoMap()
  social?: ProfileSocialDto;

  @AutoMap()
  createdAt!: Date;
  @AutoMap()
  updatedAt!: Date;
}
