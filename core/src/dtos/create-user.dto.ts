import { IsEmail, IsString, MinLength, IsDefined, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  public email!: string;

  @IsDefined()
  @MinLength(6)
  public password!: string;
}
