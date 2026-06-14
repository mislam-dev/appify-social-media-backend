import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { Comment } from '../entities/comment.entity';
import { CommentRepliesService } from './comment-replies.service';

const mockParent: Partial<Comment> = {
  id: 'parent-uuid',
  text: 'Parent comment',
  post_id: 'post-uuid',
  user_id: 'user-uuid',
  parent_id: null,
};

const mockReply: Partial<Comment> = {
  id: 'reply-uuid',
  text: 'This is a reply',
  post_id: 'post-uuid',
  user_id: 'user-uuid',
  parent_id: 'parent-uuid',
};

const mockCommentRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
};

const mockPaginationHelper = {
  meta: jest.fn().mockReturnValue({ total: 1, page: 1, limit: 10 }),
  links: jest.fn().mockReturnValue({ prev: null, next: null }),
};

describe('CommentRepliesService', () => {
  let service: CommentRepliesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentRepliesService,
        { provide: getRepositoryToken(Comment), useValue: mockCommentRepo },
        { provide: PaginationHelper, useValue: mockPaginationHelper },
      ],
    }).compile();

    service = module.get<CommentRepliesService>(CommentRepliesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reply under a valid top-level comment', async () => {
      mockCommentRepo.findOne.mockResolvedValue(mockParent);
      const dto = { text: 'This is a reply' };
      mockCommentRepo.create.mockReturnValue(mockReply);
      mockCommentRepo.save.mockResolvedValue(mockReply);

      const result = await service.create('parent-uuid', 'user-uuid', dto as any);
      expect(mockCommentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parent_id: 'parent-uuid',
          post_id: mockParent.post_id,
          user_id: 'user-uuid',
        }),
      );
      expect(result).toEqual(mockReply);
    });

    it('should throw NotFoundException if parent comment does not exist', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create('bad-id', 'user-uuid', { text: 'reply' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated replies for a parent comment', async () => {
      mockCommentRepo.findAndCount.mockResolvedValue([[mockReply], 1]);
      const result = await service.findAll('parent-uuid', 1, 10);
      expect(result.data).toEqual([mockReply]);
      expect(result.meta).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a reply when found', async () => {
      mockCommentRepo.findOne.mockResolvedValue(mockReply);
      const result = await service.findOne('parent-uuid', 'reply-uuid');
      expect(result).toEqual(mockReply);
    });

    it('should throw NotFoundException when reply does not exist', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('parent-uuid', 'bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the reply when user is the owner', async () => {
      mockCommentRepo.findOne.mockResolvedValue({ ...mockReply });
      const updated = { ...mockReply, text: 'Updated reply' };
      mockCommentRepo.save.mockResolvedValue(updated);

      const result = await service.update(
        'parent-uuid',
        'reply-uuid',
        'user-uuid',
        { text: 'Updated reply' } as any,
      );
      expect(result.text).toBe('Updated reply');
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockCommentRepo.findOne.mockResolvedValue({ ...mockReply, user_id: 'other-user' });
      await expect(
        service.update('parent-uuid', 'reply-uuid', 'user-uuid', {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove the reply and return null when user is the owner', async () => {
      mockCommentRepo.findOne.mockResolvedValue({ ...mockReply });
      mockCommentRepo.remove.mockResolvedValue(undefined);
      const result = await service.remove('parent-uuid', 'reply-uuid', 'user-uuid');
      expect(result).toBeNull();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockCommentRepo.findOne.mockResolvedValue({ ...mockReply, user_id: 'other-user' });
      await expect(
        service.remove('parent-uuid', 'reply-uuid', 'user-uuid'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
