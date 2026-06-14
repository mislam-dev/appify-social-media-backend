import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { JwtAuthGuard } from 'src/core/authentication/auth/guards/jwt-auth.guard';
import { Post } from './entities/post.entity';
import { PostLikesModule } from './post-likes/post-likes.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), PostLikesModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PaginationHelper,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [PostsService],
})
export class PostsModule {}
