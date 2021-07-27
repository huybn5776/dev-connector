import { AutoMap } from '@automapper/classes';

export class ProfileSocialDto {
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
