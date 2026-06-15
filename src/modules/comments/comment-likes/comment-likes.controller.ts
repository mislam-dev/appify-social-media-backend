import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AuthUser } from 'src/core/authentication/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/core/authentication/auth/guards/jwt-auth.guard';
import { User } from 'src/modules/users/entities/user.entity';
import { CommentLikesService } from './comment-likes.service';

@Controller('comments/:comment_id/likes')
@UseGuards(JwtAuthGuard)
export class CommentLikesController {
  constructor(private readonly commentLikesService: CommentLikesService) {}

  @Get()
  findAll(
    @Param('comment_id') commentId: string,
    @Query() { page, limit }: PaginationDto,
    @AuthUser() user: User,
  ) {
    return this.commentLikesService.findAllByComment(
      user.id,
      commentId,
      page,
      limit,
    );
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  toggle(@Param('comment_id') commentId: string, @AuthUser() user: User) {
    return this.commentLikesService.toggle(commentId, user.id);
  }
}
