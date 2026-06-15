import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from './file-upload.constants';

export type CloudinaryApi = typeof cloudinary;

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (config: ConfigService): CloudinaryApi => {
    cloudinary.config({
      cloud_name: config.get<string>('cloudinary.cloudName'),
      api_key: config.get<string>('cloudinary.apiKey'),
      api_secret: config.get<string>('cloudinary.apiSecret'),
      secure: true,
    });
    return cloudinary;
  },
};
