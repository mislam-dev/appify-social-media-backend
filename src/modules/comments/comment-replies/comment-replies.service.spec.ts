import { Test, TestingModule } from '@nestjs/testing';
import { CommentRepliesService } from './comment-replies.service';

describe('CommentRepliesService', () => {
  let service: CommentRepliesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentRepliesService],
    }).compile();

    service = module.get<CommentRepliesService>(CommentRepliesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
