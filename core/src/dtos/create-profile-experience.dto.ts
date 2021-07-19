import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsDate, IsDefined } from 'class-validator';

export class CreateProfileExperienceDto {
  @AutoMap()
  @IsDefined()
  @IsString()
  title!: string;

  @AutoMap()
  @IsDefined()
  @IsString()
  company!: string;

  @AutoMap()
  @IsString()
  location?: string;

  @AutoMap()
  @IsDefined()
  @Type(() => Date)
  @IsDate()
  from!: Date;

  @AutoMap()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @AutoMap()
  @IsBoolean()
  current?: boolean;

  @AutoMap()
  @IsString()
  description?: string;
}
