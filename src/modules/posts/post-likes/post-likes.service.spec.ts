import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { PostLike } from './entities/post-like.entity';
import { PostLikesService } from './post-likes.service';

const mockPostLikeRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  findAndCount: jest.fn(),
};

const mockPaginationHelper = {
  meta: jest.fn().mockReturnValue({ total: 1, page: 1, limit: 10 }),
  links: jest.fn().mockReturnValue({ prev: null, next: null }),
};

describe('PostLikesService', () => {
  let service: PostLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostLikesService,
        { provide: getRepositoryToken(PostLike), useValue: mockPostLikeRepo },
        { provide: PaginationHelper, useValue: mockPaginationHelper },
      ],
    }).compile();

    service = module.get<PostLikesService>(PostLikesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggle', () => {
    it('should remove like and return { liked: false } if already liked', async () => {
      const existing = { post_id: 'post-uuid', user_id: 'user-uuid' };
      mockPostLikeRepo.findOne.mockResolvedValue(existing);
      mockPostLikeRepo.remove.mockResolvedValue(undefined);

      const result = await service.toggle('post-uuid', 'user-uuid');
      expect(mockPostLikeRepo.remove).toHaveBeenCalledWith(existing);
      expect(result).toEqual({ liked: false });
    });

    it('should create like and return { liked: true } if not yet liked', async () => {
      mockPostLikeRepo.findOne.mockResolvedValue(null);
      const newLike = { post_id: 'post-uuid', user_id: 'user-uuid' };
      mockPostLikeRepo.create.mockReturnValue(newLike);
      mockPostLikeRepo.save.mockResolvedValue(newLike);

      const result = await service.toggle('post-uuid', 'user-uuid');
      expect(mockPostLikeRepo.create).toHaveBeenCalledWith({
        post_id: 'post-uuid',
        user_id: 'user-uuid',
      });
      expect(result).toEqual({ liked: true });
    });
  });

  describe('findAllByPost', () => {
    it('should return paginated likes with user info', async () => {
      const like = {
        post_id: 'post-uuid',
        user_id: 'user-uuid',
        user: { id: 'user-uuid', first_name: 'A', last_name: 'B' },
      };
      mockPostLikeRepo.findAndCount.mockResolvedValue([[like], 1]);

      const result = await service.findAllByPost('post-uuid', 1, 10);
      expect(result.data).toEqual([like]);
      expect(result.meta).toBeDefined();
      expect(result.links).toBeDefined();
    });
  });
});
