import { AutoMap } from '@automapper/classes';
import { IsEmail, IsString, MinLength, IsDefined, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @AutoMap()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  public fullName!: string;

  @AutoMap()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  public username!: string;

  @AutoMap()
  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  public email!: string;

  @AutoMap()
  @IsDefined()
  @MinLength(6)
  public password!: string;
}
