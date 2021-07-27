import { AutoMap } from '@automapper/classes';

import { User } from '@entities/user';

export class PostLike {
  @AutoMap()
  user!: User;
}
