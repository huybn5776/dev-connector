import { CreatePostDto } from '@dtos/create-post.dto';
import HttpException from '@exceptions/http-exception';
import { Post } from '@interfaces/post';
import { PostModel, PostDocument } from '@models/post.model';
import { UserDocument, UserModel } from '@models/user.model';

class PostsService {
  readonly posts = PostModel;

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
}

export default PostsService;
