import { AutoMap } from '@automapper/classes';

export class ProfileExperience {
  _id?: string;

  @AutoMap()
  title!: string;
  @AutoMap()
  company!: string;
  @AutoMap()
  location?: string;
  @AutoMap()
  from!: Date;
  @AutoMap()
  to?: Date;
  @AutoMap()
  current?: boolean;
  @AutoMap()
  description?: string;
}
