import { Request, Response } from 'express';

import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostDto } from '@dtos/post.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
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
    res.status(200).send(postDtoList);
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

  deletePost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.user.claims().id;
    await this.postsService.deletePost(userId, postId);
    res.status(200).send();
  };

  getLikes = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const likes = await this.postsService.getLikes(postId);
    const likesDto = mapper.mapArray(likes, PostLikeDto, PostLike);
    res.status(200).send(likesDto);
  };

  addLike = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.user.claims().id;
    const likes = await this.postsService.addLike(userId, postId);
    const likesDto = mapper.mapArray(likes, PostLikeDto, PostLike);
    res.status(201).send(likesDto);
  };

  deleteLike = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.user.claims().id;
    const likes = await this.postsService.deleteLike(userId, postId);
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
    const comments = await this.postsService.addPostComment(user, postId, commentData);
    const commentDtoList = mapper.mapArray(comments, PostCommentDto, PostComment);
    res.status(201).send(commentDtoList);
  };

  deletePostComment = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.claims().id;
    const { postId, commentId } = req.params;
    const comments = await this.postsService.deleteComment(userId, postId, commentId);
    const commentDtoList = mapper.mapArray(comments, PostCommentDto, PostComment);
    res.status(200).send(commentDtoList);
  };
}

export default PostsController;
