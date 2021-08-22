import { Document, model, Schema } from 'mongoose';

import { Post } from '@entities/post';
import { PostCommentDocument } from '@models/post-comment.model';
import { UserDocument } from '@models/user.model';

const postSchema = new Schema<Post>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    author: { type: String },
    avatar: { type: String },
    likes: [{ user: { type: Schema.Types.ObjectId, ref: 'User' } }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'PostComment' }],
  },
  { timestamps: true },
);

export type PostDocument = Post & Document & { user: UserDocument; comments: PostCommentDocument[] } & { _id: string };

export const PostModel = model<PostDocument>('Post', postSchema);
