import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call register', async () => {
    const dto = { email: 'a@b.com', password: 'pass123', fullName: 'A' };
    mockAuthService.register.mockResolvedValue({ accessToken: 'tok' });
    await controller.register(dto as any);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should call login', async () => {
    const dto = { email: 'a@b.com', password: 'pass123' };
    mockAuthService.login.mockResolvedValue({ accessToken: 'tok' });
    await controller.login(dto as any);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('should return current user from me()', () => {
    const user = { id: '1', email: 'a@b.com' };
    mockAuthService.getMe.mockReturnValue(user);
    const result = controller.me({ user } as any);
    expect(result).toEqual(user);
  });
});
