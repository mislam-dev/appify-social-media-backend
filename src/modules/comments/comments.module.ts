import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHelper } from '../../common/pagination/pagination.helper';
import { CommentLikesModule } from './comment-likes/comment-likes.module';
import { CommentRepliesModule } from './comment-replies/comment-replies.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    CommentLikesModule,
    CommentRepliesModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, PaginationHelper],
  exports: [CommentsService],
})
export class CommentsModule {}
