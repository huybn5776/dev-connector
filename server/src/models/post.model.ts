import { Document, model, Schema, ObjectId } from 'mongoose';

import { Post } from '@entities/post';
import { PostCommentDocument } from '@models/post-comment.model';
import { UserDocument } from '@models/user.model';

const postSchema = new Schema<Post>(
  {
    user: { type: Schema.Types.ObjectId },
    text: { type: String, required: true },
    name: { type: String },
    avatar: { type: String },
    likes: [{ user: { type: Schema.Types.ObjectId, ref: 'User' } }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'PostComment' }],
  },
  { timestamps: true },
);

export type PostDocument = Post &
  Document<ObjectId> & { user: UserDocument; comments: PostCommentDocument[] };

export const PostModel = model<PostDocument>('Post', postSchema);
