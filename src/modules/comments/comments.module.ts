import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { JwtAuthGuard } from 'src/core/authentication/auth/guards/jwt-auth.guard';
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
  providers: [
    CommentsService,
    PaginationHelper,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
