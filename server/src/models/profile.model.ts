import { Document, model, Schema, SchemaDefinition } from 'mongoose';

import { Profile } from '@entities/profile';
import { UserDocument } from '@models/user.model';

const profileSchema = new Schema<Profile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String },
    website: { type: String },
    location: { type: String },
    status: { type: String, required: true },
    skills: { type: [String], required: true },
    bio: { type: String },
    githubUsername: { type: String },
    experiences: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String },
        from: { type: Date, required: true },
        to: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String },
      },
    ],
    educations: [
      {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, required: true },
        from: { type: Date, required: true },
        to: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String },
      },
    ],
    social: {
      youtube: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      linkedin: { type: String },
      instagram: { type: String },
    },
  } as SchemaDefinition<Profile>,
  { timestamps: true },
);

export type ProfileDocument = Profile & Document & { user: UserDocument };

export const ProfileModel = model<ProfileDocument>('Profile', profileSchema);
