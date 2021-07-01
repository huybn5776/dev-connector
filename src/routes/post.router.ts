import { Router } from 'express';

import PostsController from '@controllers/posts.controller';
import { CreatePostDto } from '@dtos/create-post.dto';
import Route from '@interfaces/routes';
import authMiddleware from '@middlewares/auth.middleware';
import { asyncHandler } from '@middlewares/error.middleware';
import validationMiddleware from '@middlewares/validation.middleware';

class PostsRoute implements Route {
  readonly path = '/posts';
  readonly router = Router();
  readonly postsController = new PostsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, asyncHandler(this.postsController.getPosts));
    this.router.get(`${this.path}/:id`, asyncHandler(this.postsController.getPost));
    this.router.post(
      `${this.path}`,
      validationMiddleware(CreatePostDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.postsController.createPost),
    );
    this.router.delete(`${this.path}/:id`, authMiddleware, asyncHandler(this.postsController.deletePost));
  }
}

export default PostsRoute;
