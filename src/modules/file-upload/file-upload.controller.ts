import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../core/authentication/auth/guards/jwt-auth.guard';
import { MAX_IMAGE_COUNT } from './file-upload.constants';
import { imageValidationPipe, multerImageOptions } from './file-upload.helper';
import { FileUploadService } from './file-upload.service';

@Controller('file-upload')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', multerImageOptions))
  async uploadImage(
    @UploadedFile(imageValidationPipe) file: Express.Multer.File,
  ) {
    const data = await this.fileUploadService.uploadImage(file);
    return { data, message: 'Image uploaded successfully' };
  }

  @Post('multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('files', MAX_IMAGE_COUNT, multerImageOptions),
  )
  async uploadImages(
    @UploadedFiles(imageValidationPipe) files: Express.Multer.File[],
  ) {
    const data = await this.fileUploadService.uploadImages(files);
    return { data, message: 'Images uploaded successfully' };
  }
}
