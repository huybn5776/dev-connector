import { PopulateOptions } from 'mongoose';

import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import { Post } from '@entities/post';
import { PostComment } from '@entities/post-comment';
import { PostLike } from '@entities/post-like';
import { User } from '@entities/user';
import HttpException from '@exceptions/http-exception';
import { PostCommentModel, PostCommentDocument } from '@models/post-comment.model';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument, UserModel } from '@models/user.model';

class PostsService {
  readonly posts = PostModel;
  readonly comments = PostCommentModel;
  readonly commentsPopulateOptions: PopulateOptions[] = [
    { path: 'user', select: ['name', 'avatar'] },
    { path: 'likes.user', select: ['id'] },
  ];
  readonly postPopulateOptions: PopulateOptions[] = [
    { path: 'user', select: ['name', 'avatar'] },
    { path: 'likes.user', select: ['name', 'avatar'] },
    {
      path: 'comments',
      populate: this.commentsPopulateOptions,
    },
  ];

  async getPosts(): Promise<Post[]> {
    const postDocuments: PostDocument[] = await this.posts
      .find()
      .sort({ created: -1 })
      .populate('user', ['name', 'avatar'])
      .populate({ path: 'comments', populate: { path: 'user', select: ['name', 'avatar'] } })
      .exec();
    return postDocuments.map((postDocument) => {
      let post = postDocument.toObject();
      post = { ...post, comments: post.comments.slice(0, 1) };
      return post;
    });
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
    const postDocument: PostDocument = await this.posts.create({
      user: user._id,
      text: postData.text,
      name: user.name,
      avatar: user.avatar,
    });
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

  async addPostComment(user: User, postId: string, commentData: CreatePostCommentDto): Promise<PostComment[]> {
    const postDocument = await this.getPostDocument(postId);
    const comment = new PostCommentModel({
      user: user._id,
      text: commentData.text,
      name: user.name,
      avatar: user.avatar,
      post: postId,
    });
    await comment.save();
    postDocument.comments.unshift(comment);
    await postDocument.save();
    return postDocument.toObject().comments;
  }

  async deleteComment(userId: string, postId: string, commentId: string): Promise<PostComment[]> {
    const postDocument = await this.getPostDocument(postId);
    const postComments: PostCommentDocument[] = postDocument.comments;
    const deletingComment = postComments.find((comment) => `${comment._id}` === commentId);
    if (!deletingComment) {
      throw new HttpException(404);
    }
    if (`${deletingComment.user._id}` !== userId) {
      throw new HttpException(403);
    }
    postDocument.comments = postDocument.comments.filter(
      (comment) => comment !== deletingComment,
    ) as PostCommentDocument[];
    await deletingComment.delete();
    await postDocument.save();
    return postDocument.toObject().comments;
  }

  private async getPostDocument(id: string): Promise<PostDocument> {
    const postDocument: PostDocument | null = await this.posts.findById(id).populate(this.postPopulateOptions);
    if (!postDocument) {
      throw new HttpException(404);
    }
    return postDocument;
  }

  private async getCommentDocument(id: string): Promise<PostCommentDocument> {
    const commentDocument: PostCommentDocument | null = await this.comments.findById(id);
    if (!commentDocument) {
      throw new HttpException(404);
    }
    return commentDocument;
  }
}

export default PostsService;
