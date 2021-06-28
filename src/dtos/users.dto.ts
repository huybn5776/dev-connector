import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email = '';

  @IsString()
  public password = '';
}
