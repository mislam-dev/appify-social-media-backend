import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  controllers: [FileUploadController],
  providers: [CloudinaryProvider, FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
