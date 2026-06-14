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
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AuthUser } from 'src/core/authentication/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/core/authentication/auth/guards/jwt-auth.guard';
import { User } from 'src/modules/users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
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
  async findAll(@Query() query: PaginationDto) {
    const data = await this.postsService.findAll(query.page, query.limit);

    return { ...data };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
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
