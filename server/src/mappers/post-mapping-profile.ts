import type { MappingProfile } from '@automapper/types';
import { Post } from '@core/entities/post';

import { mapId } from '@/utils/mapper-utils';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { PostDto } from '@dtos/post.dto';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';

export const postMappingProfile: MappingProfile = (mapper) => {
  mapper.createMap(Post, PostDto).forMember(...mapId());
  mapper.createMap(PostComment, PostCommentDto).forMember(...mapId());
  mapper.createMap(PostLike, PostLikeDto);
};
