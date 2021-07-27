import { AutoMap } from '@automapper/classes';

import { User } from '@entities/user';

export class PostComment {
  @AutoMap()
  _id!: string;
  @AutoMap()
  user?: User;
  @AutoMap()
  text!: string;
  @AutoMap()
  name?: string;
  @AutoMap()
  avatar?: string;
  @AutoMap()
  createdAt!: Date;
  @AutoMap()
  updatedAt!: Date;
}
