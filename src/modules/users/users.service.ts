import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../common/exceptions';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  updateProfile(
    id: string,
    data: { name?: string; bio?: string; avatar?: string },
  ) {
    return this.usersRepository.updateProfile(id, data);
  }
}
