import { ConflictException, Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserNotFoundException } from '../../common/exceptions';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    if (await this.usersRepository.existsByEmail(dto.email)) {
      throw new ConflictException(`A user with email "${dto.email}" already exists.`);
    }
    if (await this.usersRepository.existsByPhone(dto.phone)) {
      throw new ConflictException(`A user with phone "${dto.phone}" already exists.`);
    }

    const user = await this.usersRepository.create(dto);
    return UserResponseDto.fromEntity(user);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<UserResponseDto>> {
    const [users, total] = await this.usersRepository.findAndCount(query.skip, query.limit);
    return new PaginatedResult(
      users.map(UserResponseDto.fromEntity),
      query.page,
      query.limit,
      total,
    );
  }

  /** Loads a user or throws; used by the wallets module to validate ownership. */
  async getEntityOrFail(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }
}
