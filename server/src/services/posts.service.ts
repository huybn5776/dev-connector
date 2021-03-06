import { PopulateOptions } from 'mongoose';

import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import { PaginationResult } from '@dtos/pagination-result';
import { Post } from '@entities/post';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';
import { User } from '@entities/user';
import HttpException from '@exceptions/http-exception';
import { mapper } from '@mappers';
import { PostCommentModel, PostCommentDocument } from '@models/post-comment.model';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument, UserModel } from '@models/user.model';

class PostsService {
  readonly posts = PostModel;
  readonly comments = PostCommentModel;
  readonly commentsPopulateOptions: PopulateOptions[] = [
    { path: 'user', select: ['fullName', 'avatar'] },
    { path: 'likes.user', select: ['id'] },
  ];
  readonly postPopulateOptions: PopulateOptions[] = [
    { path: 'user', select: ['fullName', 'avatar'] },
    { path: 'likes.user', select: ['id'] },
    {
      path: 'comments',
      populate: this.commentsPopulateOptions,
    },
  ];

  async getPosts(limit?: number, offset?: number): Promise<PaginationResult<Post>> {
    let postsQuery = this.posts
      .find()
      .sort({ createdAt: -1 })
      .populate('user', ['fullName', 'avatar'])
      .populate({ path: 'comments', populate: { path: 'user', select: ['fullName', 'avatar'] } });
    if (limit) {
      postsQuery = postsQuery.limit(limit);
    }
    if (offset) {
      postsQuery = postsQuery.skip(offset);
    }
    const postDocuments: PostDocument[] = await postsQuery.exec();
    const posts = postDocuments.map((postDocument) => {
      let post = postDocument.toObject();
      post = { ...post, comments: post.comments.slice(0, 1) };
      return post;
    });
    const total = await this.posts.count().exec();
    return { total, offset, items: posts };
  }

  async getPostsCommentsCount(postIds: string[]): Promise<Record<string, number>> {
    const postDocuments: Pick<PostDocument, '_id' | 'comments'>[] | null = await this.posts
      .find()
      .where('_id')
      .in(postIds)
      .select('comments')
      .exec();

    const commentsCountMap = {} as Record<string, number>;
    postDocuments.forEach((post) => {
      commentsCountMap[post._id] = post.comments.length;
    });
    return commentsCountMap;
  }

  async getPost(id: string): Promise<Post> {
    return (await this.getPostDocument(id)).toObject();
  }

  async createPost(user: UserDocument, postData: CreatePostDto): Promise<Post> {
    const post = mapper.map(postData, Post, CreatePostDto);
    const postDocument: PostDocument = await this.posts.create({
      ...post,
      user,
      author: user.fullName,
      username: user.username,
      avatar: user.avatar,
    });
    return postDocument.toObject();
  }

  async patchPost(userId: string, postId: string, postData: CreatePostDto): Promise<Post> {
    const postDocument: PostDocument = await this.getPostDocument(postId);
    if (!postDocument.user?._id || `${postDocument.user?._id}` !== userId) {
      throw new HttpException(403);
    }
    mapper.map(postData, Post, CreatePostDto, postDocument);
    await postDocument.save();
    return postDocument.toObject();
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const postDocument: PostDocument | null = await this.posts.findById(postId);
    if (!postDocument) {
      throw new HttpException(404);
    }
    if (`${postDocument.user._id}` !== userId) {
      throw new HttpException(403);
    }

    await this.comments.deleteMany({ _id: { $in: postDocument.comments } });
    await postDocument.delete();
  }

  async getPostLikes(id: string): Promise<PostLike[]> {
    const post = await this.getPost(id);
    return post.likes;
  }

  async getCommentLikes(id: string): Promise<PostLike[]> {
    const comment: PostCommentDocument | null = await this.comments
      .findById(id)
      .select('likes')
      .populate('likes.user', ['name', 'avatar']);
    if (!comment) {
      throw new HttpException(404);
    }
    return comment.likes;
  }

  async addLikeToPost(userId: string, postId: string): Promise<PostLike[]> {
    const postDocument = await this.getPostDocument(postId);
    const liked = postDocument.likes.find((like) => `${like.user._id}` === `${userId}`);
    if (liked) {
      throw new HttpException(400, 'Already liked');
    }
    postDocument.likes.unshift({ user: new UserModel({ _id: userId }) });
    await postDocument.save();
    return postDocument.toObject().likes;
  }

  async deleteLikeOfPost(userId: string, postId: string): Promise<PostLike[]> {
    const postDocument = await this.getPostDocument(postId);
    const liked = postDocument.likes.find((like) => `${like.user._id}` === `${userId}`);
    if (!liked) {
      throw new HttpException(400, 'Not yet been liked');
    }
    postDocument.likes = postDocument.likes.filter((like) => `${like.user._id}` !== `${userId}`);

    await postDocument.save();
    return postDocument.toObject().likes;
  }

  async addLikeToComment(userId: string, commentId: string): Promise<PostLike[]> {
    const commentDocument = await this.getCommentDocument(commentId);
    const liked = commentDocument?.likes.find((like) => `${like.user._id}` === `${userId}`);
    if (liked) {
      throw new HttpException(400, 'Already liked');
    }
    commentDocument.likes.unshift({ user: new UserModel({ _id: userId }) });
    await commentDocument.save();
    return commentDocument.toObject().likes;
  }

  async deleteLikeOfComment(userId: string, commentId: string): Promise<PostLike[]> {
    const commentDocument = await this.getCommentDocument(commentId);
    const liked = commentDocument?.likes.find((like) => `${like.user._id}` === `${userId}`);
    if (!liked) {
      throw new HttpException(400, 'Not yet been liked');
    }
    commentDocument.likes = commentDocument.likes.filter((like) => `${like.user._id}` !== `${userId}`);

    await commentDocument.save();
    return commentDocument.toObject().likes;
  }

  async getPostComments(id: string): Promise<PostComment[]> {
    const post = await this.getPost(id);
    return post.comments;
  }

  async addPostComment(user: User, postId: string, commentData: CreatePostCommentDto): Promise<PostComment> {
    const postDocument = await this.getPostDocument(postId);
    const comment = mapper.map(commentData, PostComment, CreatePostCommentDto);
    const commentDocument = new PostCommentModel({
      ...comment,
      user,
      author: user.fullName,
      username: user.username,
      avatar: user.avatar,
      post: postId,
    });
    await commentDocument.save();
    postDocument.comments.unshift(commentDocument);
    await postDocument.save();
    return commentDocument.toObject();
  }

  async patchPostComment(userId: string, commentId: string, commentData: CreatePostCommentDto): Promise<PostComment> {
    const commentDocument = await this.getCommentDocument(commentId);
    if (!commentDocument.user?._id || `${commentDocument.user._id}` !== userId) {
      throw new HttpException(403);
    }
    mapper.map(commentData, PostComment, CreatePostCommentDto, commentDocument);
    await commentDocument.save();
    return commentDocument.toObject();
  }

  async deleteComment(userId: string, postId: string, commentId: string): Promise<void> {
    const commentDocument: PostCommentDocument | null = await this.comments.findById(commentId);
    if (!commentDocument) {
      throw new HttpException(404);
    }
    if (`${commentDocument.user._id}` !== userId) {
      throw new HttpException(403);
    }
    await commentDocument.delete();
  }

  private async getPostDocument(id: string): Promise<PostDocument> {
    const postDocument: PostDocument | null = await this.posts.findById(id).populate(this.postPopulateOptions);
    if (!postDocument) {
      throw new HttpException(404);
    }
    return postDocument;
  }

  private async getCommentDocument(id: string): Promise<PostCommentDocument> {
    const commentDocument: PostCommentDocument | null = await this.comments
      .findById(id)
      .populate(this.commentsPopulateOptions);
    if (!commentDocument) {
      throw new HttpException(404);
    }
    return commentDocument;
  }
}

export default PostsService;
