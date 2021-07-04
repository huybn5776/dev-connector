import { User } from '@interfaces/users';

export interface PostComment {
  _id: string;
  user?: User;
  text: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
