import { Document, model, ObjectId, Schema, SchemaDefinition } from 'mongoose';

import { User } from '@interfaces/users';

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
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

export type UserDocument = User & Document<ObjectId>;

export const UserModel = model<UserDocument>('User', userSchema);
