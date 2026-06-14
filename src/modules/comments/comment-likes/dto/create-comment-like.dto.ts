import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCommentLikeDto {
  @IsUUID()
  @IsNotEmpty()
  commentId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
