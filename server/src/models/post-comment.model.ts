import { Document, model, Schema, ObjectId } from 'mongoose';

import { PostComment } from '@interfaces/post-comment';
import { UserDocument } from '@models/user.model';

const postCommentSchema = new Schema<PostComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    text: { type: String, required: true },
    name: { type: String },
    avatar: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type PostCommentDocument = PostComment & Document<ObjectId> & { user: UserDocument };

export const PostCommentModel = model<PostCommentDocument>('PostComment', postCommentSchema);
