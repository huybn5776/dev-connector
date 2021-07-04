import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsDate, IsDefined } from 'class-validator';

export class CreateProfileExperienceDto {
  @IsDefined()
  @IsString()
  title!: string;

  @IsDefined()
  @IsString()
  company!: string;

  @IsString()
  location?: string;

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
