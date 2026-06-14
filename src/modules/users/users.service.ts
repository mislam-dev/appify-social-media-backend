import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordHelper } from '../../common/helpers/password.helper';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordHelper: PasswordHelper,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashed = await this.passwordHelper.hash(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashed,
    });
    return this.userRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /** Returns user WITH password for auth verification only */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'first_name', 'last_name'],
    });
  }

  async usersForPostLikes(userIds: string[]) {
    const users = userIds.length
      ? await this.userRepository
          .createQueryBuilder('user')
          .select(['user.id', 'user.first_name', 'user.last_name'])
          .where('user.id IN (:...ids)', { ids: userIds })
          .getMany()
      : [];
    return users;
  }
}
