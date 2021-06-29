import { IsEmail, IsString, MinLength, IsDefined } from 'class-validator';

export class CreateUserDto {
  @IsDefined()
  @IsString()
  public name!: string;

  @IsDefined()
  @IsEmail()
  public email!: string;

  @IsDefined()
  @MinLength(6)
  public password!: string;
}
