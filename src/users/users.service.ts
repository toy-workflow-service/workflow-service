import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDTO } from 'src/_common/dtos/user.dto';
import { LoginDTO } from 'src/_common/dtos/login.dto';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(newUser: UserDTO): Promise<void> {
    let { password } = newUser;
    const salt = await bcrypt.genSalt();

    const existUser: UserDTO = await this.usersRepository.findOne({
      where: { email: newUser.email },
    });
    if (existUser) throw new HttpException('이미 존재하는 이메일입니다.', HttpStatus.CONFLICT);
    console.log(password);
    password = await bcrypt.hash(password, salt);
    newUser.password = password;
    console.log(password, newUser.password);
    await this.usersRepository.save(newUser);
  }

  async login(
    userInfo: LoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string; userName: string } | undefined> {
    const existUser: User = await this.usersRepository.findOne({ where: { email: userInfo.email } });
    if (!existUser)
      throw new HttpException('존재하지 않은 이메일이거나 비밀번호가 틀렸습니다.', HttpStatus.PRECONDITION_FAILED);
    const validatePassword = await bcrypt.compare(userInfo.password, existUser.password);

    if (!validatePassword)
      throw new HttpException('존재하지 않은 이메일이거나 비밀번호가 틀렸습니다.', HttpStatus.PRECONDITION_FAILED);

    const accessToken = this.jwtService.sign(
      { id: existUser.id },
      process.env.ACCESS_SECRET_KEY,
      process.env.ACCESS_EXPIRE_TIME,
    );
    const refreshToken = this.jwtService.sign(
      { id: existUser.id },
      process.env.REFRESH_SECRET_KEY,
      process.env.REFRESH_EXPIRE_TIME,
    );

    return { accessToken, refreshToken, userName: existUser.name };
  }

  async tokenValidateUser(userId: number) {
    return await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'phone_number', 'profile_url'],
    });
  }
}
