import { Document, model, Schema, SchemaDefinition } from 'mongoose';

import { User } from '@entities/user';

const userSchema = new Schema<User>(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
  } as SchemaDefinition<User>,
  { timestamps: true },
);

export type UserDocument = User & Document;

export const UserModel = model<UserDocument>('User', userSchema);
