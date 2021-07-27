import { AutoMap } from '@automapper/classes';

import { UserDto } from '@dtos/user.dto';

export class PostLikeDto {
  @AutoMap()
  user!: UserDto;
}
