import { Test, TestingModule } from '@nestjs/testing';
import { CommentLikesController } from './comment-likes.controller';
import { CommentLikesService } from './comment-likes.service';

const mockCommentLikesService = {
  toggle: jest.fn(),
  findAllByComment: jest.fn(),
};

const mockUser = { id: 'user-uuid' };

describe('CommentLikesController', () => {
  let controller: CommentLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentLikesController],
      providers: [
        { provide: CommentLikesService, useValue: mockCommentLikesService },
      ],
    }).compile();

    controller = module.get<CommentLikesController>(CommentLikesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call commentLikesService.findAllByComment with commentId and pagination', async () => {
      const paginated = { data: [], meta: {}, links: {} };
      mockCommentLikesService.findAllByComment.mockResolvedValue(paginated);
      const result = await controller.findAll(
        'c-uuid',
        { page: 1, limit: 10 },
        mockUser as any,
      );
      expect(mockCommentLikesService.findAllByComment).toHaveBeenCalledWith(
        mockUser.id,
        'c-uuid',
        1,
        10,
      );
      expect(result).toEqual(paginated);
    });
  });

  describe('toggle', () => {
    it('should call commentLikesService.toggle and return liked: true', async () => {
      mockCommentLikesService.toggle.mockResolvedValue({ liked: true });
      const result = await controller.toggle('c-uuid', mockUser as any);
      expect(mockCommentLikesService.toggle).toHaveBeenCalledWith(
        'c-uuid',
        mockUser.id,
      );
      expect(result).toEqual({ liked: true });
    });

    it('should return liked: false when unliking', async () => {
      mockCommentLikesService.toggle.mockResolvedValue({ liked: false });
      const result = await controller.toggle('c-uuid', mockUser as any);
      expect(result).toEqual({ liked: false });
    });
  });
});
