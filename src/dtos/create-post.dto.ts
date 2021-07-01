import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class CreatePostDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  text!: string;
}
