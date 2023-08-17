import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async tokenValidateUser(userId: number) {
    return await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'phone_number', 'profile_url'],
    });
  }
}
