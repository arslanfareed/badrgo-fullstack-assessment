import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  create(user: Pick<UserEntity, 'name' | 'phone' | 'email'>): Promise<UserEntity> {
    return this.repository.save(this.repository.create(user));
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAndCount(skip: number, take: number): Promise<[UserEntity[], number]> {
    return this.repository.findAndCount({
      // Embed wallets so the UI can go from a user to its wallets without a
      // separate list-wallets endpoint.
      relations: { wallets: true },
      order: { createdAt: 'DESC', wallets: { createdAt: 'ASC' } },
      skip,
      take,
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repository.exists({ where: { email } });
  }

  async existsByPhone(phone: string): Promise<boolean> {
    return this.repository.exists({ where: { phone } });
  }
}
