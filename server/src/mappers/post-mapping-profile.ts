import { ignore } from '@automapper/core';
import type { MappingProfile } from '@automapper/types';
import { Post } from '@core/entities/post';

import { mapId } from '@/utils/mapper-utils';
import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { PostDto } from '@dtos/post.dto';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';

export const postMappingProfile: MappingProfile = (mapper) => {
  mapper.createMap(Post, PostDto).forMember(...mapId());
  mapper
    .createMap(CreatePostDto, Post)
    .forMember((source) => source._id, ignore())
    .forMember((source) => source.user, ignore())
    .forMember((source) => source.author, ignore())
    .forMember((source) => source.avatar, ignore())
    .forMember((source) => source.likes, ignore())
    .forMember((source) => source.comments, ignore())
    .forMember((source) => source.createdAt, ignore())
    .forMember((source) => source.updatedAt, ignore());
  mapper.createMap(PostComment, PostCommentDto).forMember(...mapId());
  mapper
    .createMap(CreatePostCommentDto, PostComment)
    .forMember((source) => source._id, ignore())
    .forMember((source) => source.user, ignore())
    .forMember((source) => source.author, ignore())
    .forMember((source) => source.avatar, ignore())
    .forMember((source) => source.likes, ignore())
    .forMember((source) => source.createdAt, ignore())
    .forMember((source) => source.updatedAt, ignore());
  mapper.createMap(PostLike, PostLikeDto);
};
