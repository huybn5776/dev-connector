import { AutoMap } from '@automapper/classes';

import { UserDto } from '@dtos/user.dto';

export class PostCommentDto {
  @AutoMap()
  id!: string;
  @AutoMap()
  user?: UserDto;
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
