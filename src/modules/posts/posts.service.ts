import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostStatus } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async create(userId: string, dto: CreatePostDto) {
    const post = this.postRepository.create({
      ...dto,
      user_id: userId,
      status: dto.status ?? PostStatus.PUBLIC,
    });
    const saved = await this.postRepository.save(post);
    return saved;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const [results, total] = await this.postRepository.findAndCount({
      where: { status: PostStatus.PUBLIC },
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
    return {
      data: results,
      meta: this.paginationHelper.meta(total, page, limit),
      links: this.paginationHelper.links('/posts', page, limit, total),
    };
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post is not found`);
    return post;
  }

  async update(userId: string, id: string, dto: UpdatePostDto) {
    const post = await this.findOne(id);
    if (post.user_id !== userId) throw new ForbiddenException('Forbidden!');

    Object.assign(post, dto);
    const saved = await this.postRepository.save(post);
    return saved;
  }

  async remove(userId: string, id: string): Promise<void> {
    const post = await this.findOne(id);
    if (post.user_id !== userId) throw new ForbiddenException('Forbidden');
    await this.postRepository.remove(post);
  }
}
