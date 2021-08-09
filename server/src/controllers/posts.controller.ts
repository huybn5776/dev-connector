import { Request, Response } from 'express';

import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { PostDto } from '@dtos/post.dto';
import { Post } from '@entities/post';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';
import { mapper } from '@mappers';
import PostsService from '@services/posts.service';

class PostsController {
  readonly postsService = new PostsService();

  getPosts = async (req: Request, res: Response): Promise<void> => {
    const posts = await this.postsService.getPosts();
    const postDtoList = mapper.mapArray(posts, PostDto, Post);
    const commentCountMap = await this.postsService.getPostsCommentsCount(postDtoList.map((post) => post.id));
    const postsWithCommentsCount: PostDto[] = postDtoList.map((post) => ({
      ...post,
      commentsCount: commentCountMap[post.id],
    }));
    res.status(200).send(postsWithCommentsCount);
  };

  getPost = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const post = await this.postsService.getPost(id);
    const postDto = mapper.map(post, PostDto, Post);
    res.status(200).send(postDto);
  };

  createPost = async (req: Request, res: Response): Promise<void> => {
    const user = await req.user.current();
    const postData = req.body;
    const post = await this.postsService.createPost(user, postData);
    const postDto = mapper.map(post, PostDto, Post);
    res.status(200).send(postDto);
  };

  patchPost = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await req.user.current();
    const postData = req.body;
    const post = await this.postsService.patchPost(user, id, postData);
    const postDto = mapper.map(post, PostDto, Post);
    res.status(200).send(postDto);
  };

  deletePost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.user.claims().id;
    await this.postsService.deletePost(userId, postId);
    res.status(200).send();
  };

  getLikesOfPost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const likes = await this.postsService.getPostLikes(postId);
    const likesDto = mapper.mapArray(likes, PostLikeDto, PostLike);
    res.status(200).send(likesDto);
  };

  addLikeToPost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.user.claims().id;
    const likes = await this.postsService.addLikeToPost(userId, postId);
    const likesDto = mapper.mapArray(likes, PostLikeDto, PostLike);
    res.status(201).send(likesDto);
  };

  deleteLikeOfPost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.user.claims().id;
    const likes = await this.postsService.deleteLikeOfPost(userId, postId);
    const likesDto = mapper.mapArray(likes, PostLikeDto, PostLike);
    res.status(200).send(likesDto);
  };

  getLikesOfComment = async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;
    const likes = await this.postsService.getCommentLikes(commentId);
    const likesDto = mapper.mapArray(likes, PostLikeDto, PostLike);
    res.status(200).send(likesDto);
  };

  addLikeToComment = async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;
    const userId = req.user.claims().id;
    const likes = await this.postsService.addLikeToComment(userId, commentId);
    const likesDto = mapper.mapArray(likes, PostLikeDto, PostLike);
    res.status(201).send(likesDto);
  };

  deleteLikeOfComment = async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;
    const userId = req.user.claims().id;
    const likes = await this.postsService.deleteLikeOfComment(userId, commentId);
    const likesDto = mapper.mapArray(likes, PostLikeDto, PostLike);
    res.status(200).send(likesDto);
  };

  getPostComments = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const comments = await this.postsService.getPostComments(postId);
    const commentDtoList = mapper.mapArray(comments, PostCommentDto, PostComment);
    res.status(200).send(commentDtoList);
  };

  addPostComment = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const user = await req.user.current();
    const commentData: CreatePostCommentDto = req.body;
    const comment = await this.postsService.addPostComment(user, postId, commentData);
    const commentDto = mapper.map(comment, PostCommentDto, PostComment);
    res.status(201).send(commentDto);
  };

  patchPostComment = async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;
    const user = await req.user.current();
    const commentData: CreatePostCommentDto = req.body;
    const comments = await this.postsService.patchPostComment(user, commentId, commentData);
    const commentDto = mapper.map(comments, PostCommentDto, PostComment);
    res.status(200).send(commentDto);
  };

  deletePostComment = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const { postId, commentId } = req.params;
    await this.postsService.deleteComment(userId, postId, commentId);
    const comments = await this.postsService.getPostComments(postId);
    const commentDtoList = mapper.mapArray(comments, PostCommentDto, PostComment);
    res.status(200).send(commentDtoList);
  };
}

export default PostsController;
