import { Type } from 'class-transformer';
import { IsDefined, IsString, IsDate, IsBoolean } from 'class-validator';

export class CreateProfileEducationDto {
  @IsDefined()
  @IsString()
  school!: string;

  @IsDefined()
  @IsString()
  degree!: string;

  @IsDefined()
  @IsString()
  fieldOfStudy!: string;

  @IsDefined()
  @Type(() => Date)
  @IsDate()
  from!: Date;

  @Type(() => Date)
  @IsDate()
  to?: Date;

  @IsBoolean()
  current?: boolean;

  @IsString()
  description?: string;
}
