import { AutoMap } from '@automapper/classes';
import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class CreatePostDto {
  @AutoMap()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  text!: string;
}
