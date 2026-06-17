import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationHelper } from '../../../common/pagination/pagination.helper';
import { CommentLikesService } from './comment-likes.service';
import { CommentLike } from './entities/comment-like.entity';

const mockCommentLikeRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  findAndCount: jest.fn(),
  count: jest.fn().mockResolvedValue(1),
};

const mockPaginationHelper = {
  meta: jest.fn().mockReturnValue({ total: 1, page: 1, limit: 10 }),
  links: jest.fn().mockReturnValue({ prev: null, next: null }),
};

describe('CommentLikesService', () => {
  let service: CommentLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentLikesService,
        {
          provide: getRepositoryToken(CommentLike),
          useValue: mockCommentLikeRepo,
        },
        { provide: PaginationHelper, useValue: mockPaginationHelper },
      ],
    }).compile();

    service = module.get<CommentLikesService>(CommentLikesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggle', () => {
    it('should remove like and return { liked: false } if already liked', async () => {
      const existing = { comment_id: 'c-uuid', user_id: 'u-uuid' };
      mockCommentLikeRepo.findOne.mockResolvedValue(existing);
      mockCommentLikeRepo.remove.mockResolvedValue(undefined);

      const result = await service.toggle('c-uuid', 'u-uuid');
      expect(mockCommentLikeRepo.remove).toHaveBeenCalledWith(existing);
      expect(result).toEqual({ liked: false });
    });

    it('should create like and return { liked: true } if not yet liked', async () => {
      mockCommentLikeRepo.findOne.mockResolvedValue(null);
      const newLike = { comment_id: 'c-uuid', user_id: 'u-uuid' };
      mockCommentLikeRepo.create.mockReturnValue(newLike);
      mockCommentLikeRepo.save.mockResolvedValue(newLike);

      const result = await service.toggle('c-uuid', 'u-uuid');
      expect(mockCommentLikeRepo.create).toHaveBeenCalledWith({
        comment_id: 'c-uuid',
        user_id: 'u-uuid',
      });
      expect(result).toEqual({ liked: true });
    });
  });

  describe('findAllByComment', () => {
    it('should return paginated likes for a comment', async () => {
      const like = {
        comment_id: 'c-uuid',
        user_id: 'u-uuid',
        user: { id: 'u-uuid', first_name: 'A', last_name: 'B' },
      };
      mockCommentLikeRepo.findAndCount.mockResolvedValue([[like], 1]);

      const result = await service.findAllByComment('u-uuid', 'c-uuid', 1, 10);
      expect(result.data).toEqual([like]);
      expect(result.meta).toBeDefined();
      expect(result.links).toBeDefined();
    });
  });
});
