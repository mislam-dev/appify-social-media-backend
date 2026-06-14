import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { UsersModule } from 'src/modules/users/users.module';
import { PostLike } from './entities/post-like.entity';
import { PostLikesController } from './post-likes.controller';
import { PostLikesService } from './post-likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike]), UsersModule],
  controllers: [PostLikesController],
  providers: [PostLikesService, PaginationHelper],
  exports: [PostLikesService],
})
export class PostLikesModule {}
