import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';

@Injectable()
export class PostLikesService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async toggle(postId: string, userId: string) {
    const existing = await this.postLikeRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existing) {
      await this.postLikeRepository.remove(existing);
      return { liked: false };
    }

    const like = this.postLikeRepository.create({
      post_id: postId,
      user_id: userId,
    });
    await this.postLikeRepository.save(like);
    return { liked: true };
  }

  async findAllByPost(userId: string, postId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [likes, total] = await this.postLikeRepository.findAndCount({
      where: { post_id: postId },
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
      select: {
        user: {
          first_name: true,
          last_name: true,
          id: true,
        },
      },
      relations: {
        user: true,
      },
    });

    const isUserLiked = await this.postLikeRepository.count({
      where: { post_id: postId, user_id: userId },
    });

    const metaObject = {
      ...this.paginationHelper.meta(total, page, limit),
      is_liked: isUserLiked > 0,
    };

    return {
      data: likes,
      meta: metaObject,
      links: this.paginationHelper.links(
        `/posts/${postId}/likes`,
        page,
        limit,
        total,
      ),
    };
  }
}
