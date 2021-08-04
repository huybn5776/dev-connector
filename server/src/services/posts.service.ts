import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import { Post } from '@entities/post';
import { PostComment } from '@entities/post-comment';
import { User } from '@entities/user';
import HttpException from '@exceptions/http-exception';
import { PostCommentModel, PostCommentDocument } from '@models/post-comment.model';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument, UserModel } from '@models/user.model';

class PostsService {
  readonly posts = PostModel;
  readonly comments = PostCommentModel;

  async getPosts(): Promise<Post[]> {
    const postDocuments: PostDocument[] = await this.posts
      .find()
      .sort({ created: -1 })
      .populate('user', ['name', 'avatar'])
      .exec();
    return postDocuments.map((post) => post.toObject());
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
    const deletedPostDocument: PostDocument | null = await this.posts.findOneAndDelete({
      user: new UserModel({ _id: userId }),
      id: postId,
    });
    if (!deletedPostDocument) {
      throw new HttpException(404);
    }
  }

  async getLikes(id: string): Promise<{ user: User }[]> {
    const post = await this.getPost(id);
    return post.likes;
  }

  async addLike(userId: string, postId: string): Promise<{ user: User }[]> {
    const postDocument = await this.getPostDocument(postId);
    const liked = postDocument.likes.find((like) => `${like.user._id}` === `${userId}`);
    if (liked) {
      throw new HttpException(400, 'Already liked');
    }
    postDocument.likes.unshift({ user: new UserModel({ _id: userId }) });
    await postDocument.save();
    return postDocument.toObject().likes;
  }

  async deleteLike(userId: string, postId: string): Promise<{ user: User }[]> {
    const postDocument = await this.getPostDocument(postId);
    const liked = postDocument.likes.find((like) => `${like.user._id}` === `${userId}`);
    if (!liked) {
      throw new HttpException(400, 'Not yet been liked');
    }
    postDocument.likes = postDocument.likes.filter((like) => `${like.user._id}` !== `${userId}`);

    await postDocument.save();
    return postDocument.toObject().likes;
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
    const postDocument: PostDocument | null = await this.posts
      .findById(id)
      .populate('user', ['name', 'avatar'])
      .populate('likes.user', ['name', 'avatar'])
      .populate({ path: 'comments', populate: { path: 'user', select: ['name', 'avatar'] } });
    if (!postDocument) {
      throw new HttpException(404);
    }
    return postDocument;
  }
}

export default PostsService;
