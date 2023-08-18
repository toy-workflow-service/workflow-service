import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDTO } from 'src/_common/dtos/user.dto';
import { LoginDTO } from 'src/_common/dtos/login.dto';
import { PasswordDTO } from 'src/_common/dtos/password.dto';
import { MailService } from 'src/_common/mail/mail.service';
import { ChangePasswordDTO } from 'src/_common/dtos/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signup(newUser: UserDTO): Promise<void> {
    let { password } = newUser;
    const salt = await bcrypt.genSalt();

    const existUser: UserDTO = await this.usersRepository.findOne({
      where: { email: newUser.email },
    });
    if (existUser) throw new HttpException('이미 존재하는 이메일입니다.', HttpStatus.CONFLICT);

    password = await bcrypt.hash(password, salt);
    newUser.password = password;

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

  async updateUserInfo(id: number, name: string, profileUrl: string): Promise<void> {
    await this.usersRepository.update({ id }, { name, profile_url: profileUrl });
  }

  async updatePassword(id: number, passwordDTO: PasswordDTO): Promise<void> {
    const existUser = await this.usersRepository.findOne({ where: { id } });
    const salt = await bcrypt.genSalt();

    const validPassword = await bcrypt.compare(passwordDTO.currentPassword, existUser.password);
    if (!validPassword) throw new HttpException('현재 비밀번호가 일치하지 않습니다.', HttpStatus.FORBIDDEN);

    const validNewPassword = await bcrypt.compare(passwordDTO.newPassword, existUser.password);
    if (validNewPassword)
      throw new HttpException('바꾸려는 비밀번호가 현재 비밀번호와 일치합니다.', HttpStatus.FORBIDDEN);

    const password = await bcrypt.hash(passwordDTO.newPassword, salt);
    await this.usersRepository.update({ id }, { password });
  }

  async findPassword(email: string): Promise<any> {
    const existUser = await this.usersRepository.findOne({ where: { email } });
    if (!existUser)
      throw new HttpException('가입되지 않은 이메일입니다. 이메일을 확인해 주세요.', HttpStatus.NOT_FOUND);

    return await this.mailService.sendEmail(email);
  }

  async changePassword(changePasswordDTO: ChangePasswordDTO): Promise<void> {
    let { password } = changePasswordDTO;
    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);

    await this.usersRepository.update({ email: changePasswordDTO.email }, { password });
  }

  async findUserByEmail(email: string): Promise<User> {
    const existUser = await this.usersRepository.findOne({ where: { email } });

    if (!existUser) throw new HttpException('해당 유저를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    return existUser;
  }

  async tokenValidateUser(userId: number) {
    return await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'phone_number', 'profile_url'],
    });
  }

  async findUserById(id: number): Promise<User> {
    const existUser = await this.usersRepository.findOne({ where: { id } });

    if (!existUser) throw new HttpException('해당 유저를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    return existUser;
  }
}
