import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsUrl()
  @IsOptional()
  image?: string;
}
