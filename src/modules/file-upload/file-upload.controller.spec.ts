import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/core/authentication/auth/guards/jwt-auth.guard';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

describe('FileUploadController', () => {
  let controller: FileUploadController;

  const uploaded = {
    url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    public_id: 'uploads/sample',
    format: 'jpg',
    width: 100,
    height: 100,
    bytes: 1024,
  };

  const serviceMock = {
    uploadImage: jest.fn().mockResolvedValue(uploaded),
    uploadImages: jest.fn().mockResolvedValue([uploaded]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [{ provide: FileUploadService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FileUploadController>(FileUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns uploaded image data for a single upload', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const file = {} as Express.Multer.File;
    const res = await controller.uploadImage(file);

    expect(serviceMock.uploadImage).toHaveBeenCalledWith(file);
    expect(res.data).toEqual(uploaded);
  });

  it('returns uploaded image data for multiple uploads', async () => {
    const files = [{}] as Express.Multer.File[];
    const res = await controller.uploadImages(files);

    expect(serviceMock.uploadImages).toHaveBeenCalledWith(files);
    expect(res.data).toEqual([uploaded]);
  });
});
