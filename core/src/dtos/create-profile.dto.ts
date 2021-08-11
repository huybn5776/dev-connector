import { AutoMap } from '@automapper/classes';
import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

import { ProfileSocialDto } from '@dtos/profile-social.dto';

export class CreateProfileDto {
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
  @IsDefined()
  status!: string;

  @AutoMap()
  @IsNotEmpty()
  @IsDefined()
  skills!: string[];

  @AutoMap()
  @IsString()
  bio?: string;

  @AutoMap()
  @IsString()
  githubUsername?: string;

  @AutoMap()
  social?: ProfileSocialDto;
}
