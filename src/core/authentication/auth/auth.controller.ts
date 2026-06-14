import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return {
      message: 'Registration successfully',
      data: null,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() { email, password }: LoginDto) {
    const tokens = await this.authService.login(email, password);
    return {
      message: 'Login success',
      data: tokens,
    };
  }

  @Get('me')
  me(@Req() req: { user: User }) {
    const user = this.authService.getMe(req.user);
    return {
      message: 'Get user profile success',
      data: user,
    };
  }
}
