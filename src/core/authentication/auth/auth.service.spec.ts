import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from './auth.service';

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

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: mockUser.email,
        password: 'password123',
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
      });

      expect(result.status_code).toBe(201);
      expect(result.data).toHaveProperty('auth_token');
      expect(result.data).toHaveProperty('refresh_token');
    });

    it('should throw ConflictException if email already in use', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      await expect(
        service.register({
          email: mockUser.email,
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);
      await expect(service.login('bad@email.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      await expect(
        service.login(mockUser.email, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('should return the current user wrapped in response envelope', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = service.getMe(mockUser as any);
      expect(result.status_code).toBe(200);
      expect(result.data).toEqual(mockUser);
    });
  });
});
