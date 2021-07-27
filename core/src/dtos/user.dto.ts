import { AutoMap } from '@automapper/classes';

export class UserDto {
  @AutoMap()
  id!: string;
  @AutoMap()
  name!: string;
  @AutoMap()
  email!: string;
  @AutoMap()
  avatar!: string;
  @AutoMap()
  updatedAt!: string;
}
