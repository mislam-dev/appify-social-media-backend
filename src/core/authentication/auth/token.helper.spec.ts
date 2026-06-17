import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenHelper } from './token.helper';

const mockJwtService = {
  sign: jest.fn(),
};

describe('TokenHelper', () => {
  let helper: TokenHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenHelper,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    helper = module.get<TokenHelper>(TokenHelper);
  });

  afterEach(() => jest.clearAllMocks());

  describe('generate', () => {
    it('should return an object with auth_token and refresh_token', () => {
      mockJwtService.sign
        .mockReturnValueOnce('auth-token-value')
        .mockReturnValueOnce('refresh-token-value');

      const payload = {
        sub: 'user-uuid',
        email: 'a@b.com',
        first_name: 'A',
        last_name: 'B',
      };
      const result = helper.generate(payload);

      expect(result).toEqual({
        auth_token: 'auth-token-value',
        refresh_token: 'refresh-token-value',
      });
    });

    it('should sign auth_token with expiresIn: 30m', () => {
      mockJwtService.sign.mockReturnValue('token');
      const payload = {
        sub: 'uuid',
        email: 'a@b.com',
        first_name: 'A',
        last_name: 'B',
      };
      helper.generate(payload);

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: '30m',
      });
    });

    it('should sign refresh_token with expiresIn: 7d', () => {
      mockJwtService.sign.mockReturnValue('token');
      const payload = {
        sub: 'uuid',
        email: 'a@b.com',
        first_name: 'A',
        last_name: 'B',
      };
      helper.generate(payload);

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: '7d',
      });
    });

    it('should call jwtService.sign exactly twice', () => {
      mockJwtService.sign.mockReturnValue('token');
      const payload = {
        sub: 'uuid',
        email: 'a@b.com',
        first_name: 'A',
        last_name: 'B',
      };
      helper.generate(payload);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
