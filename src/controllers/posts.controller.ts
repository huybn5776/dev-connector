import { Request, Response } from 'express';

import PostsService from '@services/posts.service';

class PostsController {
  readonly postsService = new PostsService();

  getPosts = async (req: Request, res: Response): Promise<void> => {
    const posts = await this.postsService.getPosts();
    res.status(200).send(posts);
  };

  getPost = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const post = await this.postsService.getPost(id);
    res.status(200).send(post);
  };

  createPost = async (req: Request, res: Response): Promise<void> => {
    const user = await req.user.current();
    const postData = req.body;
    const post = await this.postsService.createPost(user, postData);
    res.status(200).send(post);
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
    res.status(200).send(likes);
  };

  addLike = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.user.claims().id;
    const likes = await this.postsService.addLike(userId, postId);
    res.status(201).send(likes);
  };

  deleteLike = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const userId = req.user.claims().id;
    const likes = await this.postsService.deleteLike(userId, postId);
    res.status(200).send(likes);
  };
}

export default PostsController;
