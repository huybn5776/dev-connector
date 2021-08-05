import { AutoMap } from '@automapper/classes';

import { User } from '@entities/user';

import { PostLike } from './post-like';

export class PostComment {
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
  @AutoMap()
  createdAt!: Date;
  @AutoMap()
  updatedAt!: Date;
}
