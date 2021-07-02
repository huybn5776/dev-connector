import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import HttpException from '@exceptions/http-exception';
import { Post } from '@interfaces/post';
import { PostComment } from '@interfaces/post-comment';
import { User } from '@interfaces/users';
import { PostCommentModel, PostCommentDocument } from '@models/post-comment.model';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument, UserModel } from '@models/user.model';

class PostsService {
  readonly posts = PostModel;
  readonly comments = PostCommentModel;

  getPosts(): Promise<Post[]> {
    return this.posts.find().sort({ created: -1 }).exec();
  }

  async getPost(id: string): Promise<PostDocument> {
    const post = await this.posts.findById(id).populate('likes.user', ['name', 'avatar']).populate('comments');
    if (!post) {
      throw new HttpException(404);
    }
    return post;
  }

  async createPost(user: UserDocument, postData: CreatePostDto): Promise<Post> {
    return this.posts.create({
      user: user._id,
      text: postData.text,
      name: user.name,
      avatar: user.avatar,
    });
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const deletedPost = await this.posts.findOneAndDelete({ user: new UserModel({ _id: userId }), id: postId });
    if (!deletedPost) {
      throw new HttpException(404);
    }
  }

  async getLikes(id: string): Promise<{ user: User }[]> {
    const post = await this.getPost(id);
    return post.likes;
  }

  async addLike(userId: string, postId: string): Promise<{ user: User }[]> {
    const post = await this.getPost(postId);
    const liked = post.likes.find((like) => `${like.user._id}` === `${userId}`);
    if (liked) {
      throw new HttpException(400, 'Already liked');
    }
    post.likes.unshift({ user: new UserModel({ _id: userId }) });
    await post.save();
    return post.likes;
  }

  async deleteLike(userId: string, postId: string): Promise<{ user: User }[]> {
    const post = await this.getPost(postId);
    const liked = post.likes.find((like) => `${like.user._id}` === `${userId}`);
    if (!liked) {
      throw new HttpException(400, 'Not yet been liked');
    }
    post.likes = post.likes.filter((like) => `${like.user._id}` !== `${userId}`);

    await post.save();
    return post.likes;
  }

  async getPostComments(id: string): Promise<PostComment[]> {
    const post = await this.getPost(id);
    return post.comments;
  }

  async addPostComment(user: User, postId: string, commentData: CreatePostCommentDto): Promise<PostComment[]> {
    const post = await this.getPost(postId);
    const comment = new PostCommentModel({
      user: new UserModel({ _id: user._id }),
      text: commentData.text,
      name: user.name,
      avatar: user.avatar,
    });
    await comment.save();
    post.comments.unshift(comment);
    await post.save();
    return post.comments;
  }

  async deleteComment(userId: string, postId: string, commentId: string): Promise<PostComment[]> {
    const post = await this.getPost(postId);
    const postComments: PostCommentDocument[] = post.comments;
    const deletingComment = postComments.find((comment) => `${comment._id}` === commentId);
    if (!deletingComment) {
      throw new HttpException(404);
    }
    if (`${deletingComment.user._id}` !== userId) {
      throw new HttpException(403);
    }
    post.comments = post.comments.filter((comment) => comment !== deletingComment) as PostCommentDocument[];
    await deletingComment.delete();
    await post.save();
    return post.comments;
  }
}

export default PostsService;
