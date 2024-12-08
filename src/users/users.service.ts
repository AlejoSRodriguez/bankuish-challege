import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userData: Partial<User>) {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async findOrCreateUser(userData: Partial<User>) {
    let user = await this.userRepository.findOne({
      where: { firebaseUid: userData.firebaseUid },
    });

    if (!user) {
      user = this.userRepository.create(userData);
      await this.userRepository.save(user);
    }

    return user;
  }
}
