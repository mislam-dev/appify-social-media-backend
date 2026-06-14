import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCommentReplyDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsUrl()
  @IsOptional()
  image?: string;
}
