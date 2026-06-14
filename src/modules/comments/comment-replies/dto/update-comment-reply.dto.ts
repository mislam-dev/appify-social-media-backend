import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentReplyDto } from './create-comment-reply.dto';

export class UpdateCommentReplyDto extends PartialType(CreateCommentReplyDto) {}
