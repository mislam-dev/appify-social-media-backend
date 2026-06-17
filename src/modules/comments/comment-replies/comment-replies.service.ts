import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { IsNull, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentReplyDto } from './dto/create-comment-reply.dto';
import { UpdateCommentReplyDto } from './dto/update-comment-reply.dto';

@Injectable()
export class CommentRepliesService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async create(
    parentCommentId: string,
    userId: string,
    dto: CreateCommentReplyDto,
  ) {
    // Verify parent comment exists and is a top-level comment
    const parent = await this.commentRepository.findOne({
      where: { id: parentCommentId, parent_id: IsNull() },
    });
    if (!parent)
      throw new NotFoundException(`Comment #${parentCommentId} not found`);

    const reply = this.commentRepository.create({
      ...dto,
      post_id: parent.post_id,
      user_id: userId,
      parent_id: parentCommentId,
    });
    const saved = await this.commentRepository.save(reply);
    return saved;
  }

  async findAll(parentCommentId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [results, total] = await this.commentRepository.findAndCount({
      where: { parent_id: parentCommentId },
      take: limit,
      skip: offset,
      order: { created_at: 'ASC' },
    });
    return {
      data: results,
      meta: this.paginationHelper.meta(total, page, limit),
      _links: this.paginationHelper.links(
        `/comments/${parentCommentId}/replies`,
        page,
        limit,
        total,
      ),
    };
  }

  async findOne(parentCommentId: string, id: string) {
    const reply = await this.commentRepository.findOne({
      where: { id, parent_id: parentCommentId },
    });
    if (!reply) throw new NotFoundException(`Reply is not found`);
    return reply;
  }

  async update(
    parentCommentId: string,
    id: string,
    userId: string,
    dto: UpdateCommentReplyDto,
  ) {
    const reply = await this.findOne(parentCommentId, id);
    if (reply.user_id !== userId)
      throw new ForbiddenException('You can only edit your own replies');
    Object.assign(reply, dto);
    const saved = await this.commentRepository.save(reply);
    return saved;
  }

  async remove(parentCommentId: string, id: string, userId: string) {
    const reply = await this.findOne(parentCommentId, id);
    if (reply.user_id !== userId)
      throw new ForbiddenException('You can only delete your own replies');
    await this.commentRepository.remove(reply);
    return null;
  }
}
