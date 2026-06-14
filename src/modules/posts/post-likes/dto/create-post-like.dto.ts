import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePostLikeDto {
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
