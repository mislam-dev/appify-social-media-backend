import { Test, TestingModule } from '@nestjs/testing';
import { PostStatus } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

const mockPost = {
  id: 'post-uuid',
  content: 'Hello',
  status: PostStatus.PUBLIC,
  user_id: 'user-uuid',
};

const mockPostsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUser = { id: 'user-uuid', email: 'a@b.com' };

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockPostsService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call postsService.create with the user id and dto', async () => {
      mockPostsService.create.mockResolvedValue(mockPost);
      const dto = { content: 'Hello' };
      const result = await controller.create(mockUser as any, dto as any);
      expect(mockPostsService.create).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should call postsService.findAll with the user id, page and limit', async () => {
      const paginated = { data: [mockPost], meta: {}, _links: {} };
      mockPostsService.findAll.mockResolvedValue(paginated);
      const result = await controller.findAll(mockUser as any, {
        page: 2,
        limit: 5,
      } as any);
      expect(mockPostsService.findAll).toHaveBeenCalledWith(mockUser.id, 2, 5);
      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('should call postsService.findOne and return the post', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);
      const result = await controller.findOne(mockUser as any, 'post-uuid');
      expect(mockPostsService.findOne).toHaveBeenCalledWith('post-uuid');
      expect(result).toEqual(mockPost);
    });

    it('should hide another user private post', async () => {
      mockPostsService.findOne.mockResolvedValue({
        ...mockPost,
        status: PostStatus.PRIVATE,
        user_id: 'other-user',
      });
      await expect(
        controller.findOne(mockUser as any, 'post-uuid'),
      ).rejects.toThrow('Post is not found');
    });
  });

  describe('update', () => {
    it('should call postsService.update with user id, post id, and dto', async () => {
      const updated = { ...mockPost, content: 'Updated' };
      mockPostsService.update.mockResolvedValue(updated);
      const result = await controller.update(
        { user: mockUser } as any,
        'post-uuid',
        { content: 'Updated' } as any,
      );
      expect(mockPostsService.update).toHaveBeenCalledWith(
        mockUser.id,
        'post-uuid',
        { content: 'Updated' },
      );
      expect(result.content).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should call postsService.remove with user id and post id', async () => {
      mockPostsService.remove.mockResolvedValue(undefined);
      await controller.remove({ user: mockUser } as any, 'post-uuid');
      expect(mockPostsService.remove).toHaveBeenCalledWith(mockUser.id, 'post-uuid');
    });
  });
});
