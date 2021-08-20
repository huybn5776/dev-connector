import { UserDocument } from '@models/user.model';

export interface RequestUser {
  claims: () => { id: string };
  current: () => Promise<UserDocument>;
}
