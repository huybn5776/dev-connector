import { AutoMap } from '@automapper/classes';

import { ProfileEducation } from '@entities/profile-education';
import { ProfileExperience } from '@entities/profile-experience';
import { ProfileSocial } from '@entities/profile-social';
import { User } from '@entities/user';

export class Profile {
  @AutoMap()
  _id!: string;

  @AutoMap()
  user!: User;

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

  @AutoMap({ typeFn: () => ProfileExperience })
  experiences!: ProfileExperience[];
  @AutoMap({ typeFn: () => ProfileEducation })
  educations!: ProfileEducation[];
  @AutoMap()
  social?: ProfileSocial;

  @AutoMap()
  createdAt!: Date;
  @AutoMap()
  updatedAt!: Date;
}
