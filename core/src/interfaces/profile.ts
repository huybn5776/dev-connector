import { ProfileEducation } from '@interfaces/profile-education';
import { ProfileExperience } from '@interfaces/profile-experience';
import { ProfileSocial } from '@interfaces/profile-social';
import { User } from '@interfaces/users';

export interface Profile {
  _id: string;
  user: User;

  company?: string;
  website?: string;
  location?: string;
  status: string;
  skills: string[];
  bio?: string;
  githubUsername?: string;

  experiences: ProfileExperience[];
  educations: ProfileEducation[];
  social?: ProfileSocial;

  createdAt: Date;
  updatedAt: Date;
}
