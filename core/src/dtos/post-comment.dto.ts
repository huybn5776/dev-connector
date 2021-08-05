import { AutoMap } from '@automapper/classes';

import { UserDto } from '@dtos/user.dto';

import { PostLikeDto } from './post-like.dto';

export class PostCommentDto {
  @AutoMap()
  id!: string;
  @AutoMap()
  user?: UserDto;
  @AutoMap()
  text!: string;
  @AutoMap()
  name?: string;
  @AutoMap()
  avatar?: string;
  @AutoMap({ typeFn: () => PostLikeDto })
  likes!: PostLikeDto[];
  @AutoMap()
  createdAt!: Date;
  @AutoMap()
  updatedAt!: Date;
}
