import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

const mockCommentsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUser = { id: 'user-uuid' };
const mockComment = { id: 'comment-uuid', text: 'Hello', post_id: 'post-uuid' };

describe('CommentsController', () => {
  let controller: CommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call commentsService.create with postId, userId, and dto', async () => {
      mockCommentsService.create.mockResolvedValue(mockComment);
      const dto = { text: 'Hello' };
      const result = await controller.create('post-uuid', mockUser as any, dto);
      expect(mockCommentsService.create).toHaveBeenCalledWith(
        'post-uuid',
        mockUser.id,
        dto,
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('findAll', () => {
    it('should call commentsService.findAll with postId and pagination', async () => {
      const paginated = { data: [mockComment], meta: {}, links: {} };
      mockCommentsService.findAll.mockResolvedValue(paginated);
      const result = await controller.findAll('post-uuid', {
        page: 1,
        limit: 10,
      });
      expect(mockCommentsService.findAll).toHaveBeenCalledWith(
        'post-uuid',
        1,
        10,
      );
      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('should call commentsService.findOne with postId and commentId', async () => {
      mockCommentsService.findOne.mockResolvedValue(mockComment);
      const result = await controller.findOne('post-uuid', 'comment-uuid');
      expect(mockCommentsService.findOne).toHaveBeenCalledWith(
        'post-uuid',
        'comment-uuid',
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('update', () => {
    it('should call commentsService.update with postId, commentId, userId, and dto', async () => {
      const updated = { ...mockComment, text: 'Updated' };
      mockCommentsService.update.mockResolvedValue(updated);
      const result = await controller.update(
        'post-uuid',
        'comment-uuid',
        mockUser as any,
        { text: 'Updated' },
      );
      expect(mockCommentsService.update).toHaveBeenCalledWith(
        'post-uuid',
        'comment-uuid',
        mockUser.id,
        { text: 'Updated' },
      );
      expect(result.text).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should call commentsService.remove with postId, commentId, and userId', async () => {
      mockCommentsService.remove.mockResolvedValue(undefined);
      await controller.remove('post-uuid', 'comment-uuid', mockUser as any);
      expect(mockCommentsService.remove).toHaveBeenCalledWith(
        'post-uuid',
        'comment-uuid',
        mockUser.id,
      );
    });
  });
});
