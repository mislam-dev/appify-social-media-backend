import {
  BadRequestException,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import {
  ALLOWED_IMAGE_MIME_REGEX,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE_BYTES,
} from './file-upload.constants';

const imageFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(
    new BadRequestException(
      `Only image uploads are allowed (${ALLOWED_IMAGE_MIME_TYPES.join(', ')})`,
    ),
    false,
  );
};

export const multerImageOptions = {
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: MAX_IMAGE_COUNT },
};

export const imageValidationPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES }),
    new FileTypeValidator({ fileType: ALLOWED_IMAGE_MIME_REGEX }),
  ],
  fileIsRequired: true,
});
