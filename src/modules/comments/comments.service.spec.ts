import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationHelper } from '../../common/pagination/pagination.helper';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

const mockComment: Partial<Comment> = {
  id: 'comment-uuid',
  text: 'Nice post',
  post_id: 'post-uuid',
  user_id: 'user-uuid',
  parent_id: null,
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

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: mockCommentRepo },
        { provide: PaginationHelper, useValue: mockPaginationHelper },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a comment with post_id and user_id', async () => {
      const dto = { text: 'Nice post' };
      mockCommentRepo.create.mockReturnValue({ ...mockComment, ...dto });
      mockCommentRepo.save.mockResolvedValue(mockComment);

      const result = await service.create('post-uuid', 'user-uuid', dto);
      expect(mockCommentRepo.create).toHaveBeenCalledWith({
        ...dto,
        post_id: 'post-uuid',
        user_id: 'user-uuid',
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe('findAll', () => {
    it('should return paginated top-level comments for a post', async () => {
      mockCommentRepo.findAndCount.mockResolvedValue([[mockComment], 1]);
      const result = await service.findAll('post-uuid', 1, 10);
      expect(result.data).toEqual([mockComment]);
      expect(result.meta).toBeDefined();
      expect(result.links).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a comment when found', async () => {
      mockCommentRepo.findOne.mockResolvedValue(mockComment);
      const result = await service.findOne('post-uuid', 'comment-uuid');
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('post-uuid', 'bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the comment when user is owner', async () => {
      mockCommentRepo.findOne.mockResolvedValue({ ...mockComment });
      const updated = { ...mockComment, text: 'Updated text' };
      mockCommentRepo.save.mockResolvedValue(updated);

      const result = await service.update(
        'post-uuid',
        'comment-uuid',
        'user-uuid',
        { text: 'Updated text' },
      );
      expect(result.text).toBe('Updated text');
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockCommentRepo.findOne.mockResolvedValue({
        ...mockComment,
        user_id: 'other-user',
      });
      await expect(
        service.update('post-uuid', 'comment-uuid', 'user-uuid', {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove the comment when user is owner', async () => {
      mockCommentRepo.findOne.mockResolvedValue({ ...mockComment });
      mockCommentRepo.remove.mockResolvedValue(undefined);
      await expect(
        service.remove('post-uuid', 'comment-uuid', 'user-uuid'),
      ).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockCommentRepo.findOne.mockResolvedValue({
        ...mockComment,
        user_id: 'other-user',
      });
      await expect(
        service.remove('post-uuid', 'comment-uuid', 'user-uuid'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
