import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHelper } from '../../../common/helpers/password.helper';
import { User } from '../../../modules/users/entities/user.entity';
import { UsersService } from '../../../modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { TokenHelper } from './token.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenHelper,
    private readonly passwordHelper: PasswordHelper,
  ) {}

  async register(dto: RegisterDto) {
    await this.usersService.create(dto);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.passwordHelper.verify(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = this.tokenService.generate({
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    });
    return tokens;
  }

  getMe(user: User) {
    return user;
  }
}
