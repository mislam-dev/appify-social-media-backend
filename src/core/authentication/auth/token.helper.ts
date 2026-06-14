import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './strategy/jwt.strategy';

@Injectable()
export class TokenHelper {
  constructor(private readonly jwtService: JwtService) {}

  generate<T extends JwtPayload>(
    payload: T,
  ): {
    auth_token: string;
    refresh_token: string;
  } {
    const auth_token = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { auth_token, refresh_token };
  }
}
