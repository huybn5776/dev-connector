import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { UserDto } from '@dtos/user.dto';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';
import { User } from '@entities/user';

export function assertUser(userDto: UserDto | undefined, user: User | undefined): void {
  expect(userDto?.id).toBe(`${user?._id}`);
  expect(userDto?.name).toBe(user?.name);
  expect(userDto?.avatar).toBe(user?.avatar);
}

export function assertComment(commentDto: PostCommentDto, comment: PostComment): void {
  expect(commentDto.text).toBe(comment.text);
  expect(commentDto.name).toBe(comment.name);
  expect(commentDto.avatar).toBe(comment.avatar);
  assertUser(commentDto.user, comment.user);

  expect(commentDto.likes).toHaveLength(comment.likes.length);
}

export function assertListingLikes(postLikesDto: PostLikeDto[], postLikes: PostLike[]): void {
  expect(postLikesDto).toHaveLength(postLikes.length);

  for (let i = 0; i < postLikes.length; i += 1) {
    const postLikeDto = postLikesDto[i];
    const postLike = postLikes[i];
    expect(postLikeDto.user.id).toBe(`${postLike.user._id}`);

    // should not have detail information in listing api
    expect(postLikeDto.user.name).not.toBeDefined();
    expect(postLikeDto.user.email).not.toBeDefined();
    expect(postLikeDto.user.avatar).not.toBeDefined();
  }
}
