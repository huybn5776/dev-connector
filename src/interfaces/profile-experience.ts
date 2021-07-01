export interface ProfileExperience {
  _id?: string;
  title: string;
  company: string;
  location?: string;
  from: Date;
  to?: Date;
  current?: boolean;
  description?: string;
}
