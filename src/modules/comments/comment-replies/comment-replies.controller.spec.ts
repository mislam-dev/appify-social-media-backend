import { Test, TestingModule } from '@nestjs/testing';
import { CommentRepliesController } from './comment-replies.controller';
import { CommentRepliesService } from './comment-replies.service';

const mockCommentRepliesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUser = { id: 'user-uuid' };
const mockReply = {
  id: 'reply-uuid',
  text: 'Reply text',
  parent_id: 'parent-uuid',
};

describe('CommentRepliesController', () => {
  let controller: CommentRepliesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentRepliesController],
      providers: [
        { provide: CommentRepliesService, useValue: mockCommentRepliesService },
      ],
    }).compile();

    controller = module.get<CommentRepliesController>(CommentRepliesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call commentRepliesService.create with commentId, userId, and dto', async () => {
      mockCommentRepliesService.create.mockResolvedValue(mockReply);
      const dto = { text: 'Reply text' };
      const result = await controller.create(
        'parent-uuid',
        mockUser as any,
        dto,
      );
      expect(mockCommentRepliesService.create).toHaveBeenCalledWith(
        'parent-uuid',
        mockUser.id,
        dto,
      );
      expect(result).toEqual(mockReply);
    });
  });

  describe('findAll', () => {
    it('should call commentRepliesService.findAll with commentId and pagination', async () => {
      const paginated = { data: [mockReply], meta: {}, _links: {} };
      mockCommentRepliesService.findAll.mockResolvedValue(paginated);
      const result = await controller.findAll('parent-uuid', 1, 10);
      expect(mockCommentRepliesService.findAll).toHaveBeenCalledWith(
        'parent-uuid',
        1,
        10,
      );
      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('should call commentRepliesService.findOne with commentId and replyId', async () => {
      mockCommentRepliesService.findOne.mockResolvedValue(mockReply);
      const result = await controller.findOne('parent-uuid', 'reply-uuid');
      expect(mockCommentRepliesService.findOne).toHaveBeenCalledWith(
        'parent-uuid',
        'reply-uuid',
      );
      expect(result).toEqual(mockReply);
    });
  });

  describe('update', () => {
    it('should call commentRepliesService.update with all required params', async () => {
      const updated = { ...mockReply, text: 'Updated' };
      mockCommentRepliesService.update.mockResolvedValue(updated);
      const result = await controller.update(
        'parent-uuid',
        'reply-uuid',
        mockUser as any,
        { text: 'Updated' },
      );
      expect(mockCommentRepliesService.update).toHaveBeenCalledWith(
        'parent-uuid',
        'reply-uuid',
        mockUser.id,
        { text: 'Updated' },
      );
      expect(result.text).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should call commentRepliesService.remove with all required params', async () => {
      mockCommentRepliesService.remove.mockResolvedValue(null);
      await controller.remove('parent-uuid', 'reply-uuid', mockUser as any);
      expect(mockCommentRepliesService.remove).toHaveBeenCalledWith(
        'parent-uuid',
        'reply-uuid',
        mockUser.id,
      );
    });
  });
});
