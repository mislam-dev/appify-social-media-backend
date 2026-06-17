import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { CommentLikesController } from './comment-likes.controller';
import { CommentLikesService } from './comment-likes.service';
import { CommentLike } from './entities/comment-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentLike])],
  controllers: [CommentLikesController],
  providers: [CommentLikesService, PaginationHelper],
  exports: [CommentLikesService],
})
export class CommentLikesModule {}
