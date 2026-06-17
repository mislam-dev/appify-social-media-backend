import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from '../../../core/authentication/auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../../core/authentication/auth/guards/jwt-auth.guard';
import { User } from '../../users/entities/user.entity';
import { CommentRepliesService } from './comment-replies.service';
import { CreateCommentReplyDto } from './dto/create-comment-reply.dto';
import { UpdateCommentReplyDto } from './dto/update-comment-reply.dto';

@Controller('comments/:comment_id/replies')
@UseGuards(JwtAuthGuard)
export class CommentRepliesController {
  constructor(private readonly commentRepliesService: CommentRepliesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('comment_id') commentId: string,
    @AuthUser() user: User,
    @Body() dto: CreateCommentReplyDto,
  ) {
    return this.commentRepliesService.create(commentId, user.id, dto);
  }

  @Get()
  findAll(
    @Param('comment_id') commentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.commentRepliesService.findAll(commentId, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('comment_id') commentId: string, @Param('id') id: string) {
    return this.commentRepliesService.findOne(commentId, id);
  }

  @Patch(':id')
  update(
    @Param('comment_id') commentId: string,
    @Param('id') id: string,
    @AuthUser() user: User,
    @Body() dto: UpdateCommentReplyDto,
  ) {
    return this.commentRepliesService.update(commentId, id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('comment_id') commentId: string,
    @Param('id') id: string,
    @AuthUser() user: User,
  ) {
    return this.commentRepliesService.remove(commentId, id, user.id);
  }
}
