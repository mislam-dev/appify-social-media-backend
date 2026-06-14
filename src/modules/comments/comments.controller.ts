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
} from '@nestjs/common';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AuthUser } from 'src/core/authentication/auth/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('posts/:post_id/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('post_id') postId: string,
    @AuthUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, user.id, dto);
  }

  @Get()
  findAll(
    @Param('post_id') postId: string,
    @Query() { page, limit }: PaginationDto,
  ) {
    return this.commentsService.findAll(postId, page, limit);
  }

  @Get(':id')
  findOne(@Param('post_id') postId: string, @Param('id') id: string) {
    return this.commentsService.findOne(postId, id);
  }

  @Patch(':id')
  update(
    @Param('post_id') postId: string,
    @Param('id') id: string,
    @AuthUser() user: User,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(postId, id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('post_id') postId: string,
    @Param('id') id: string,
    @AuthUser() user: User,
  ) {
    return this.commentsService.remove(postId, id, user.id);
  }
}
