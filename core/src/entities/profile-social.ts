import { AutoMap } from '@automapper/classes';

export class ProfileSocial {
  @AutoMap()
  youtube?: string;
  @AutoMap()
  twitter?: string;
  @AutoMap()
  facebook?: string;
  @AutoMap()
  linkedin?: string;
  @AutoMap()
  instagram?: string;
}
