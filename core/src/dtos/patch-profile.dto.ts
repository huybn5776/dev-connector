import { AutoMap } from '@automapper/classes';
import { IsString, IsNotEmpty } from 'class-validator';

import { ProfileSocialDto } from '@dtos/profile-social.dto';

export class PatchProfileDto {
  @AutoMap()
  @IsString()
  company?: string;

  @AutoMap()
  @IsString()
  website?: string;

  @AutoMap()
  @IsString()
  location?: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  status?: string;

  @AutoMap()
  @IsNotEmpty()
  skills?: string[];

  @AutoMap()
  @IsString()
  bio?: string;

  @AutoMap()
  @IsString()
  githubUsername?: string;

  @AutoMap()
  social?: ProfileSocialDto;
}
