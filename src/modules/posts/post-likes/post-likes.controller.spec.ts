import { Test, TestingModule } from '@nestjs/testing';
import { PostLikesController } from './post-likes.controller';
import { PostLikesService } from './post-likes.service';

const mockPostLikesService = {
  toggle: jest.fn(),
  findAllByPost: jest.fn(),
};

const mockUser = { id: 'user-uuid' };

describe('PostLikesController', () => {
  let controller: PostLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostLikesController],
      providers: [{ provide: PostLikesService, useValue: mockPostLikesService }],
    }).compile();

    controller = module.get<PostLikesController>(PostLikesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call postLikesService.findAllByPost with postId and pagination', async () => {
      const paginated = { data: [], meta: {}, links: {} };
      mockPostLikesService.findAllByPost.mockResolvedValue(paginated);
      const result = await controller.findAll(
        'post-uuid',
        { page: 1, limit: 10 } as any,
        mockUser as any,
      );
      expect(mockPostLikesService.findAllByPost).toHaveBeenCalledWith(
        mockUser.id,
        'post-uuid',
        1,
        10,
      );
      expect(result).toEqual(paginated);
    });
  });

  describe('toggle', () => {
    it('should call postLikesService.toggle with postId and userId', async () => {
      mockPostLikesService.toggle.mockResolvedValue({ liked: true });
      const result = await controller.toggle('post-uuid', mockUser as any);
      expect(mockPostLikesService.toggle).toHaveBeenCalledWith('post-uuid', mockUser.id);
      expect(result).toEqual({ liked: true });
    });

    it('should return { liked: false } when unliking', async () => {
      mockPostLikesService.toggle.mockResolvedValue({ liked: false });
      const result = await controller.toggle('post-uuid', mockUser as any);
      expect(result).toEqual({ liked: false });
    });
  });
});
