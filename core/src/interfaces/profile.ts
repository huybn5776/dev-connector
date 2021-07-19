import { AutoMap } from '@automapper/classes';

import { ProfileEducation } from '@interfaces/profile-education';
import { ProfileExperience } from '@interfaces/profile-experience';
import { ProfileSocial } from '@interfaces/profile-social';
import { User } from '@interfaces/users';

export class Profile {
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

  @AutoMap()
  experiences!: ProfileExperience[];
  @AutoMap()
  educations!: ProfileEducation[];
  @AutoMap()
  social?: ProfileSocial;

  createdAt!: Date;
  updatedAt!: Date;
}
