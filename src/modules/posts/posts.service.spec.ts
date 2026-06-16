import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationHelper } from 'src/common/pagination/pagination.helper';
import { CreatePostDto } from './dto/create-post.dto';
import { Post, PostStatus } from './entities/post.entity';
import { PostsService } from './posts.service';

const mockPost: Post = {
  id: 'post-uuid',
  content: 'Hello world',
  image: null,
  status: PostStatus.PUBLIC,
  user_id: 'user-uuid',
  created_at: new Date(),
  updated_at: new Date(),
  user: null as any,
};

const mockPostRepo = {
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

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockPostRepo },
        { provide: PaginationHelper, useValue: mockPaginationHelper },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post with PUBLIC status by default', async () => {
      const dto: CreatePostDto = { content: 'Hello' };
      mockPostRepo.create.mockReturnValue({ ...mockPost, content: 'Hello' });
      mockPostRepo.save.mockResolvedValue(mockPost);

      await service.create('user-uuid', dto);
      expect(mockPostRepo.create).toHaveBeenCalledWith({
        ...dto,
        user_id: 'user-uuid',
        status: PostStatus.PUBLIC,
      });
    });

    it('should use provided status when specified', async () => {
      const dto: CreatePostDto = { content: 'Private post', status: PostStatus.PRIVATE };
      mockPostRepo.create.mockReturnValue({ ...mockPost, status: PostStatus.PRIVATE });
      mockPostRepo.save.mockResolvedValue({ ...mockPost, status: PostStatus.PRIVATE });

      await service.create('user-uuid', dto);
      expect(mockPostRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: PostStatus.PRIVATE }),
      );
    });

    it('should return the saved post', async () => {
      mockPostRepo.create.mockReturnValue(mockPost);
      mockPostRepo.save.mockResolvedValue(mockPost);
      const result = await service.create('user-uuid', { content: 'Hello' });
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return paginated posts visible to the user', async () => {
      mockPostRepo.findAndCount.mockResolvedValue([[mockPost], 1]);
      const result = await service.findAll('user-uuid', 1, 10);
      expect(result.data).toEqual([mockPost]);
      expect(result.meta).toBeDefined();
      expect(result._links).toBeDefined();
    });

    it('should include public posts and the user own private posts', async () => {
      mockPostRepo.findAndCount.mockResolvedValue([[mockPost], 1]);
      await service.findAll('user-uuid', 1, 10);
      expect(mockPostRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { status: PostStatus.PUBLIC },
            { status: PostStatus.PRIVATE, user_id: 'user-uuid' },
          ],
        }),
      );
    });

    it('should use default page and limit when not provided', async () => {
      mockPostRepo.findAndCount.mockResolvedValue([[], 0]);
      await service.findAll('user-uuid');
      expect(mockPostRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 0 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a post when found', async () => {
      mockPostRepo.findOne.mockResolvedValue(mockPost);
      const result = await service.findOne('post-uuid');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the post when user is the owner', async () => {
      mockPostRepo.findOne.mockResolvedValue({ ...mockPost });
      const updated = { ...mockPost, content: 'Updated content' };
      mockPostRepo.save.mockResolvedValue(updated);

      const result = await service.update('user-uuid', 'post-uuid', {
        content: 'Updated content',
      });
      expect(result.content).toBe('Updated content');
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockPostRepo.findOne.mockResolvedValue({ ...mockPost, user_id: 'other-user' });
      await expect(
        service.update('user-uuid', 'post-uuid', { content: 'x' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove the post when user is the owner', async () => {
      mockPostRepo.findOne.mockResolvedValue({ ...mockPost });
      mockPostRepo.remove.mockResolvedValue(undefined);
      await expect(service.remove('user-uuid', 'post-uuid')).resolves.toBeUndefined();
      expect(mockPostRepo.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockPostRepo.findOne.mockResolvedValue({ ...mockPost, user_id: 'other-user' });
      await expect(service.remove('user-uuid', 'post-uuid')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
