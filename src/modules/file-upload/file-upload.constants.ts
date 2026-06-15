export const CLOUDINARY = 'CLOUDINARY';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_IMAGE_MIME_REGEX = /^image\/(jpeg|png|webp|gif)$/;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const MAX_IMAGE_COUNT = 10;
