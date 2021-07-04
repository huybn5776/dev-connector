import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class CreatePostCommentDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  text!: string;
}
