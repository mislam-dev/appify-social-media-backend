import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { Repository } from 'typeorm';
import { CommentLike } from './entities/comment-like.entity';

@Injectable()
export class CommentLikesService {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async toggle(commentId: string, userId: string) {
    const existing = await this.commentLikeRepository.findOne({
      where: { comment_id: commentId, user_id: userId },
    });

    if (existing) {
      await this.commentLikeRepository.remove(existing);
      return { liked: false };
    }

    const like = this.commentLikeRepository.create({
      comment_id: commentId,
      user_id: userId,
    });
    await this.commentLikeRepository.save(like);
    return { liked: true };
  }

  async findAllByComment(
    userId: string,
    commentId: string,
    page = 1,
    limit = 10,
  ) {
    const offset = (page - 1) * limit;

    const [likes, total] = await this.commentLikeRepository.findAndCount({
      where: { comment_id: commentId },
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
      relations: {
        user: true,
      },
      select: {
        user: {
          first_name: true,
          last_name: true,
          id: true,
        },
      },
    });
    const isUserLiked = await this.commentLikeRepository.count({
      where: { comment_id: commentId, user_id: userId },
    });

    return {
      data: likes,
      meta: {
        ...this.paginationHelper.meta(total, page, limit),
        is_liked: isUserLiked > 0,
      },
      links: this.paginationHelper.links(
        `/comments/${commentId}/likes`,
        page,
        limit,
        total,
      ),
    };
  }
}
