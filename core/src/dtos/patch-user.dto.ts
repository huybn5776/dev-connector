import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class PatchUserDto {
  @IsString()
  @IsNotEmpty()
  public fullName?: string;

  @IsEmail()
  @IsNotEmpty()
  public email?: string;

  @IsString()
  public originalPassword?: string;

  @MinLength(6)
  @IsNotEmpty()
  public password?: string;
}
