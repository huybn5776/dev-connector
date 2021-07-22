import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsDate, IsNotEmpty } from 'class-validator';

export class PatchProfileEducationDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  school?: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  degree?: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  fieldOfStudy?: string;

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
