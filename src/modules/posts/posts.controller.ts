import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '../../common/pagination/pagination.dto';
import { AuthUser } from '../../core/authentication/auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../core/authentication/auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from './entities/post.entity';
import { PostsService } from './posts.service';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@AuthUser() user: User, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Get()
  async findAll(@AuthUser() user: User, @Query() query: PaginationDto) {
    const data = await this.postsService.findAll(
      user.id,
      query.page,
      query.limit,
    );

    return { ...data };
  }

  @Get(':id')
  async findOne(@AuthUser() user: User, @Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    if (post.status === PostStatus.PRIVATE && post.user_id !== user.id) {
      throw new NotFoundException('Post is not found');
    }
    return post;
  }

  @Patch(':id')
  update(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: { user: User }, @Param('id') id: string) {
    return this.postsService.remove(req.user.id, id);
  }
}
