import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AuthUser } from 'src/core/authentication/auth/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { CommentLikesService } from './comment-likes.service';

@Controller('comments/:comment_id/likes')
export class CommentLikesController {
  constructor(private readonly commentLikesService: CommentLikesService) {}

  @Get()
  findAll(
    @Param('comment_id') commentId: string,
    @Query() { page, limit }: PaginationDto,
  ) {
    return this.commentLikesService.findAllByComment(commentId, page, limit);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  toggle(@Param('comment_id') commentId: string, @AuthUser() user: User) {
    return this.commentLikesService.toggle(commentId, user.id);
  }
}
