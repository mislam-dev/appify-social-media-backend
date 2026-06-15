import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CLOUDINARY } from './file-upload.constants';
import { FileUploadService, UploadedImage } from './file-upload.service';

describe('FileUploadService', () => {
  let service: FileUploadService;

  const uploadResponse = {
    secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    public_id: 'uploads/sample',
    format: 'jpg',
    width: 100,
    height: 100,
    bytes: 1024,
  };

  const uploadStream = jest.fn(
    (_opts: unknown, cb: (err: unknown, res: unknown) => void) => ({
      end: () => cb(undefined, uploadResponse),
    }),
  );

  const cloudinaryMock = { uploader: { upload_stream: uploadStream } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        { provide: CLOUDINARY, useValue: cloudinaryMock },
        { provide: ConfigService, useValue: { get: () => 'uploads' } },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uploads a single image and maps the response', async () => {
    const file = { buffer: Buffer.from('x') } as Express.Multer.File;
    const result: UploadedImage = await service.uploadImage(file);

    expect(uploadStream).toHaveBeenCalled();
    expect(result.url).toBe(uploadResponse.secure_url);
    expect(result.public_id).toBe(uploadResponse.public_id);
  });

  it('uploads multiple images', async () => {
    const files = [
      { buffer: Buffer.from('a') },
      { buffer: Buffer.from('b') },
    ] as Express.Multer.File[];
    const results = await service.uploadImages(files);

    expect(results).toHaveLength(2);
  });
});
