import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { Post } from './entities/post.entity';
import { PostLikesModule } from './post-likes/post-likes.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), PostLikesModule],
  controllers: [PostsController],
  providers: [PostsService, PaginationHelper],
  exports: [PostsService],
})
export class PostsModule {}
