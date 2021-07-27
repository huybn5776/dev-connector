import { AutoMap } from '@automapper/classes';

import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { UserDto } from '@dtos/user.dto';

export class PostDto {
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
  @AutoMap({ typeFn: () => PostCommentDto })
  comments!: PostCommentDto[];
  @AutoMap()
  createdAt!: Date;
  @AutoMap()
  updatedAt!: Date;
}
