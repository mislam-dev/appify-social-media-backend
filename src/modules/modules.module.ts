import { Module } from '@nestjs/common';
import { CommentsModule } from './comments/comments.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [UsersModule, PostsModule, CommentsModule, FileUploadModule],
})
export class ModulesModule {}
