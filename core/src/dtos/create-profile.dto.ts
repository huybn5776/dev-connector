import { IsString, IsNotEmpty } from 'class-validator';

import { ProfileSocial } from '@interfaces/profile-social';

export class CreateProfileDto {
  @IsString()
  company?: string;

  @IsString()
  website?: string;

  @IsString()
  location?: string;

  @IsString()
  status!: string;

  @IsNotEmpty()
  skills!: string[];

  @IsString()
  bio?: string;

  @IsString()
  githubUsername?: string;

  social?: ProfileSocial;
}
