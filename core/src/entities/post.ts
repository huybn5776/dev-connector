import { AutoMap } from '@automapper/classes';

import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';
import { User } from '@entities/user';

export class Post {
  @AutoMap()
  _id!: string;
  @AutoMap()
  user?: User;
  @AutoMap()
  text!: string;
  @AutoMap()
  name?: string;
  @AutoMap()
  avatar?: string;
  @AutoMap({ typeFn: () => PostLike })
  likes!: PostLike[];
  @AutoMap({ typeFn: () => PostComment })
  comments!: PostComment[];
  @AutoMap()
  createdAt!: Date;
  @AutoMap()
  updatedAt!: Date;
}
