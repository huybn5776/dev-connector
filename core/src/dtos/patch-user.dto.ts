import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class PatchUserDto {
  @IsString()
  @IsNotEmpty()
  public name?: string;

  @IsEmail()
  @IsNotEmpty()
  public email?: string;

  @MinLength(6)
  @IsNotEmpty()
  public password?: string;
}
