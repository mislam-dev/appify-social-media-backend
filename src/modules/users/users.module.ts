import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordHelper } from '../../common/helpers/password.helper';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { IsEmailUniqueConstraint } from './validators/is-email-unique.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, PasswordHelper, IsEmailUniqueConstraint],
  exports: [UsersService, IsEmailUniqueConstraint],
})
export class UsersModule {}
