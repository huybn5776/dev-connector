import { PostComment } from '@interfaces/post-comment';
import { User } from '@interfaces/users';

export interface Post {
  _id: string;
  user?: User;
  text: string;
  name?: string;
  avatar?: string;
  likes: { user: User }[];
  comments: PostComment[];
  createdAt: Date;
  updatedAt: Date;
}
