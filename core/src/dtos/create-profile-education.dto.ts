import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { IsDefined, IsString, IsDate, IsBoolean } from 'class-validator';

export class CreateProfileEducationDto {
  @AutoMap()
  @IsDefined()
  @IsString()
  school!: string;

  @AutoMap()
  @IsDefined()
  @IsString()
  degree!: string;

  @AutoMap()
  @IsDefined()
  @IsString()
  fieldOfStudy!: string;

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
