import { AutoMap } from '@automapper/classes';

export class ProfileEducationDto {
  @AutoMap()
  id!: string;

  @AutoMap()
  school!: string;
  @AutoMap()
  degree!: string;
  @AutoMap()
  fieldOfStudy!: string;
  @AutoMap()
  from!: Date;
  @AutoMap()
  to?: Date;
  @AutoMap()
  current?: boolean;
  @AutoMap()
  description?: string;
}
