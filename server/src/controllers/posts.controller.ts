import {
  Get,
  JsonController,
  Param,
  HttpCode,
  CurrentUser,
  Body,
  Patch,
  Delete,
  Post,
  Authorized,
  OnUndefined,
} from 'routing-controllers';

import { RequestUser } from '@/interfaces/request-user';
import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { PostDto } from '@dtos/post.dto';
import { Post as AppPost } from '@entities/post';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';
import { mapper } from '@mappers';
import PostsService from '@services/posts.service';

@JsonController('/posts')
class PostsController {
  readonly postsService = new PostsService();

  @Get()
  async getPosts(): Promise<PostDto[]> {
    const posts = await this.postsService.getPosts();
    const postDtoList = mapper.mapArray(posts, PostDto, AppPost);
    const commentCountMap = await this.postsService.getPostsCommentsCount(postDtoList.map((post) => post.id));
    return postDtoList.map((post) => ({
      ...post,
      commentsCount: commentCountMap[post.id],
    }));
  }

  @Get('/:id')
  async getPost(@Param('id') id: string): Promise<PostDto> {
    const post = await this.postsService.getPost(id);
    return mapper.map(post, PostDto, AppPost);
  }

  @Post('/')
  @Authorized()
  @HttpCode(201)
  async createPost(@Body() postData: CreatePostDto, @CurrentUser() currentUser: RequestUser): Promise<PostDto> {
    const user = await currentUser.current();
    const post = await this.postsService.createPost(user, postData);
    return mapper.map(post, PostDto, AppPost);
  }

  @Patch('/:id')
  @Authorized()
  async patchPost(
    @Param('id') id: string,
    @Body() postData: CreatePostDto,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PostDto> {
    const userId = currentUser.claims().id;
    const post = await this.postsService.patchPost(userId, id, postData);
    return mapper.map(post, PostDto, AppPost);
  }

  @Delete('/:id')
  @Authorized()
  @OnUndefined(204)
  async deletePost(@Param('id') postId: string, @CurrentUser() currentUser: RequestUser): Promise<void> {
    const userId = currentUser.claims().id;
    await this.postsService.deletePost(userId, postId);
  }

  @Get('/:id/likes')
  async getLikesOfPost(@Param('id') postId: string): Promise<PostLikeDto[]> {
    const likes = await this.postsService.getPostLikes(postId);
    return mapper.mapArray(likes, PostLikeDto, PostLike);
  }

  @Post('/:id/likes')
  @Authorized()
  @HttpCode(201)
  async addLikeToPost(@Param('id') postId: string, @CurrentUser() currentUser: RequestUser): Promise<PostLikeDto[]> {
    const userId = currentUser.claims().id;
    const likes = await this.postsService.addLikeToPost(userId, postId);
    return mapper.mapArray(likes, PostLikeDto, PostLike);
  }

  @Delete('/:id/likes')
  @Authorized()
  async deleteLikeOfPost(@Param('id') postId: string, @CurrentUser() currentUser: RequestUser): Promise<PostLikeDto[]> {
    const userId = currentUser.claims().id;
    const likes = await this.postsService.deleteLikeOfPost(userId, postId);
    return mapper.mapArray(likes, PostLikeDto, PostLike);
  }

  @Get('/comments/:id/likes')
  async getLikesOfComment(@Param('id') commentId: string): Promise<PostLikeDto[]> {
    const likes = await this.postsService.getCommentLikes(commentId);
    return mapper.mapArray(likes, PostLikeDto, PostLike);
  }

  @Post('/comments/:id/likes')
  @Authorized()
  @HttpCode(201)
  async addLikeToComment(
    @Param('id') commentId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PostLikeDto[]> {
    const userId = currentUser.claims().id;
    const likes = await this.postsService.addLikeToComment(userId, commentId);
    return mapper.mapArray(likes, PostLikeDto, PostLike);
  }

  @Delete('/comments/:id/likes')
  @Authorized()
  async deleteLikeOfComment(
    @Param('id') commentId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PostLikeDto[]> {
    const userId = currentUser.claims().id;
    const likes = await this.postsService.deleteLikeOfComment(userId, commentId);
    return mapper.mapArray(likes, PostLikeDto, PostLike);
  }

  @Get('/:id/comments')
  async getPostComments(@Param('id') postId: string): Promise<PostCommentDto[]> {
    const comments = await this.postsService.getPostComments(postId);
    return mapper.mapArray(comments, PostCommentDto, PostComment);
  }

  @Post('/:id/comments')
  @Authorized()
  @HttpCode(201)
  async addPostComment(
    @Param('id') postId: string,
    @CurrentUser() currentUser: RequestUser,
    @Body() commentData: CreatePostCommentDto,
  ): Promise<PostCommentDto> {
    const comment = await this.postsService.addPostComment(await currentUser.current(), postId, commentData);
    return mapper.map(comment, PostCommentDto, PostComment);
  }

  @Patch('/comments/:id')
  @Authorized()
  async patchPostComment(
    @Param('id') commentId: string,
    @CurrentUser() currentUser: RequestUser,
    @Body() commentData: CreatePostCommentDto,
  ): Promise<PostCommentDto> {
    const userId = currentUser.claims().id;
    const comments = await this.postsService.patchPostComment(userId, commentId, commentData);
    return mapper.map(comments, PostCommentDto, PostComment);
  }

  @Delete('/:postId/comments/:commentId')
  @Authorized()
  async deletePostComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<PostCommentDto[]> {
    const userId = currentUser.claims().id;
    await this.postsService.deleteComment(userId, postId, commentId);
    const comments = await this.postsService.getPostComments(postId);
    return mapper.mapArray(comments, PostCommentDto, PostComment);
  }
}

export default PostsController;
