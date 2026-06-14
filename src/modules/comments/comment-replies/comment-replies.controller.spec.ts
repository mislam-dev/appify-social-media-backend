import { Test, TestingModule } from '@nestjs/testing';
import { CommentRepliesController } from './comment-replies.controller';
import { CommentRepliesService } from './comment-replies.service';

describe('CommentRepliesController', () => {
  let controller: CommentRepliesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentRepliesController],
      providers: [CommentRepliesService],
    }).compile();

    controller = module.get<CommentRepliesController>(CommentRepliesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
