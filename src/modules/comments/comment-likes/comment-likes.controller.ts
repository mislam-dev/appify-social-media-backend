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
import { PaginationDto } from '../../../common/pagination/pagination.dto';
import { AuthUser } from '../../../core/authentication/auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../../core/authentication/auth/guards/jwt-auth.guard';
import { User } from '../../users/entities/user.entity';
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
