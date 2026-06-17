import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHelper } from '../../../common/helpers/password.helper';
import { UsersService } from '../../../modules/users/users.service';
import { AuthService } from './auth.service';
import { TokenHelper } from './token.helper';

const mockUser = {
  id: 'user-uuid',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  password: '$2b$10$hashedpassword',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockUsersService = {
  findByEmailWithPassword: jest.fn(),
  create: jest.fn(),
};

const mockTokenHelper = {
  generate: jest.fn().mockReturnValue({
    auth_token: 'mock-auth',
    refresh_token: 'mock-refresh',
  }),
};

const mockPasswordHelper = {
  hash: jest.fn(),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokenHelper, useValue: mockTokenHelper },
        { provide: PasswordHelper, useValue: mockPasswordHelper },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should call usersService.create with the provided dto', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      const dto = {
        email: 'a@b.com',
        password: 'pass1234',
        first_name: 'A',
        last_name: 'B',
      };
      await service.register(dto);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });

    it('should return undefined (register has no return value)', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      const result = await service.register({
        email: 'a@b.com',
        password: 'pass1234',
        first_name: 'A',
        last_name: 'B',
      });
      expect(result).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);
      await expect(service.login('bad@email.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordHelper.verify.mockResolvedValue(false);
      await expect(
        service.login(mockUser.email, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return auth_token and refresh_token on valid credentials', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordHelper.verify.mockResolvedValue(true);
      const result = await service.login(mockUser.email, 'correct-password');
      expect(result).toHaveProperty('auth_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should call tokenHelper.generate with the correct payload', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockPasswordHelper.verify.mockResolvedValue(true);
      await service.login(mockUser.email, 'correct-password');
      expect(mockTokenHelper.generate).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
      });
    });
  });

  describe('getMe', () => {
    it('should return the user object directly', () => {
      const result = service.getMe(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
