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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with the dto', async () => {
      mockAuthService.register.mockResolvedValue(undefined);
      const dto = {
        email: 'a@b.com',
        password: 'pass1234',
        first_name: 'A',
        last_name: 'B',
      };
      await controller.register(dto as any);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });

    it('should return success message with null data', async () => {
      mockAuthService.register.mockResolvedValue(undefined);
      const result = await controller.register({
        email: 'a@b.com',
        password: 'pass1234',
        first_name: 'A',
        last_name: 'B',
      } as any);
      expect(result).toEqual({ message: 'Registration successfully', data: null });
    });
  });

  describe('login', () => {
    it('should call authService.login with email and password', async () => {
      const tokens = { auth_token: 'tok', refresh_token: 'refresh' };
      mockAuthService.login.mockResolvedValue(tokens);
      const dto = { email: 'a@b.com', password: 'pass1234' };
      await controller.login(dto as any);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.email, dto.password);
    });

    it('should return tokens wrapped in data envelope', async () => {
      const tokens = { auth_token: 'tok', refresh_token: 'refresh' };
      mockAuthService.login.mockResolvedValue(tokens);
      const result = await controller.login({
        email: 'a@b.com',
        password: 'pass1234',
      } as any);
      expect(result).toEqual({ data: tokens });
    });
  });

  describe('me', () => {
    it('should return user profile wrapped in message and data', () => {
      const user = { id: '1', email: 'a@b.com' };
      mockAuthService.getMe.mockReturnValue(user);
      const result = controller.me({ user } as any);
      expect(result).toEqual({ message: 'Get user profile success', data: user });
    });
  });
});
