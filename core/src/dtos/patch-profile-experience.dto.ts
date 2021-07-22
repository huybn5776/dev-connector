import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsDate, IsNotEmpty } from 'class-validator';

export class PatchProfileExperienceDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  company?: string;

  @AutoMap()
  @IsString()
  location?: string;

  @AutoMap()
  @Type(() => Date)
  @IsDate()
  from?: Date;

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
