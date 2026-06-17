import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationHelper } from '../../common/pagination/pagination.helper';
import { IsNull, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async create(postId: string, userId: string, dto: CreateCommentDto) {
    const comment = this.commentRepository.create({
      ...dto,
      post_id: postId,
      user_id: userId,
    });
    return this.commentRepository.save(comment);
  }

  async findAll(postId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [results, total] = await this.commentRepository.findAndCount({
      where: { post_id: postId, parent_id: IsNull() },
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
    return {
      data: results,
      meta: this.paginationHelper.meta(total, page, limit),
      links: this.paginationHelper.links(
        `/posts/${postId}/comments`,
        page,
        limit,
        total,
      ),
    };
  }

  async findOne(postId: string, id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, post_id: postId, parent_id: IsNull() },
    });
    if (!comment) throw new NotFoundException(`Comment #${id} not found`);
    return comment;
  }

  async update(
    postId: string,
    id: string,
    userId: string,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.findOne(postId, id);
    if (comment.user_id !== userId)
      throw new ForbiddenException('You can only edit your own comments');

    Object.assign(comment, dto);
    return await this.commentRepository.save(comment);
  }

  async remove(postId: string, id: string, userId: string) {
    const comment = await this.findOne(postId, id);
    if (comment.user_id !== userId)
      throw new ForbiddenException('You can only delete your own comments');
    await this.commentRepository.remove(comment);
  }
}
