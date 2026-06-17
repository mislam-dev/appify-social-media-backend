import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { Comment } from '../entities/comment.entity';
import { CommentRepliesController } from './comment-replies.controller';
import { CommentRepliesService } from './comment-replies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  controllers: [CommentRepliesController],
  providers: [CommentRepliesService, PaginationHelper],
  exports: [CommentRepliesService],
})
export class CommentRepliesModule {}
