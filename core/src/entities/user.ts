import { AutoMap } from '@automapper/classes';

export class User {
  @AutoMap()
  _id!: string;
  @AutoMap()
  fullName!: string;
  @AutoMap()
  username!: string;
  @AutoMap()
  email!: string;
  @AutoMap()
  password!: string;
  @AutoMap()
  avatar!: string;
  @AutoMap()
  createdAt!: Date;
  @AutoMap()
  updatedAt!: Date;
}
