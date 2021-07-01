export interface ProfileEducation {
  _id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  from: Date;
  to?: Date;
  current?: boolean;
  description?: string;
}
