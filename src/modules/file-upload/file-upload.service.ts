import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import type { CloudinaryApi } from './cloudinary.provider';
import { CLOUDINARY } from './file-upload.constants';

export interface UploadedImage {
  url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

@Injectable()
export class FileUploadService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: CloudinaryApi,
    private readonly config: ConfigService,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadedImage> {
    const folder = this.config.get<string>('cloudinary.folder') ?? 'uploads';

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error?: UploadApiErrorResponse, res?: UploadApiResponse) => {
          if (error || !res) {
            return reject(
              new InternalServerErrorException(
                error?.message ?? 'Image upload failed',
              ),
            );
          }
          resolve(res);
        },
      );

      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  }

  async uploadImages(files: Express.Multer.File[]): Promise<UploadedImage[]> {
    return Promise.all(files.map((file) => this.uploadImage(file)));
  }
}
