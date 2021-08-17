import { Router } from 'express';

import Route from '@/interfaces/routes';
import PostsController from '@controllers/posts.controller';
import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
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
    this.router.patch(
      `${this.path}/:id`,
      validationMiddleware(CreatePostDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.postsController.patchPost),
    );
    this.router.delete(`${this.path}/:id`, authMiddleware, asyncHandler(this.postsController.deletePost));

    this.router.get(`${this.path}/:id/likes`, asyncHandler(this.postsController.getLikesOfPost));
    this.router.post(`${this.path}/:id/likes`, authMiddleware, asyncHandler(this.postsController.addLikeToPost));
    this.router.delete(`${this.path}/:id/likes`, authMiddleware, asyncHandler(this.postsController.deleteLikeOfPost));
    this.router.get(`${this.path}/comments/:id/likes`, asyncHandler(this.postsController.getLikesOfComment));
    this.router.post(
      `${this.path}/comments/:id/likes`,
      authMiddleware,
      asyncHandler(this.postsController.addLikeToComment),
    );
    this.router.delete(
      `${this.path}/comments/:id/likes`,
      authMiddleware,
      asyncHandler(this.postsController.deleteLikeOfComment),
    );

    this.router.get(`${this.path}/:id/comments`, asyncHandler(this.postsController.getPostComments));
    this.router.post(
      `${this.path}/:id/comments`,
      validationMiddleware(CreatePostCommentDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.postsController.addPostComment),
    );
    this.router.patch(
      `${this.path}/comments/:id`,
      validationMiddleware(CreatePostCommentDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.postsController.patchPostComment),
    );
    this.router.delete(
      `${this.path}/:postId/comments/:commentId`,
      authMiddleware,
      asyncHandler(this.postsController.deletePostComment),
    );
  }
}

export default PostsRoute;
