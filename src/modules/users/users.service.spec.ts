import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordHelper } from 'src/common/helpers/password.helper';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const mockUser: User = {
  id: 'uuid-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: 'hashed',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockUserRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockPasswordHelper = {
  hash: jest.fn().mockResolvedValue('hashed'),
  verify: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: PasswordHelper, useValue: mockPasswordHelper },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password and save a new user', async () => {
      const dto: CreateUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'plainpass',
      };
      mockUserRepo.create.mockReturnValue({ ...dto, password: 'hashed' });
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await service.create(dto);
      expect(mockPasswordHelper.hash).toHaveBeenCalledWith('plainpass');
      expect(mockUserRepo.create).toHaveBeenCalledWith({ ...dto, password: 'hashed' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne('uuid-1');
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('john@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('nobody@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should call findOne with password fields selected', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmailWithPassword('john@example.com');
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        select: ['id', 'email', 'password', 'first_name', 'last_name'],
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('usersForPostLikes', () => {
    it('should return empty array when given no ids', async () => {
      const result = await service.usersForPostLikes([]);
      expect(result).toEqual([]);
      expect(mockUserRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should query and return users for given ids', async () => {
      const mockQb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.usersForPostLikes(['uuid-1']);
      expect(mockQb.where).toHaveBeenCalledWith('user.id IN (:...ids)', { ids: ['uuid-1'] });
      expect(result).toEqual([mockUser]);
    });
  });
});
