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
import { PostLikesService } from './post-likes.service';

@Controller('posts/:post_id/likes')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @Get()
  findAll(
    @Param('post_id') postId: string,
    @Query() { page, limit }: PaginationDto,
  ) {
    return this.postLikesService.findAllByPost(postId, page, limit);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  toggle(@Param('post_id') postId: string, @AuthUser() user: User) {
    return this.postLikesService.toggle(postId, user.id);
  }
}
