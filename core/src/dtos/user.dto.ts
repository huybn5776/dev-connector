import { AutoMap } from '@automapper/classes';

export class UserDto {
  @AutoMap()
  id!: string;
  @AutoMap()
  fullName!: string;
  @AutoMap()
  username!: string;
  @AutoMap()
  email!: string;
  @AutoMap()
  avatar!: string;
  @AutoMap()
  createdAt!: string;
  @AutoMap()
  updatedAt!: string;
}
