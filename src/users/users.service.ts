import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { Repository } from 'typeorm';
import { UserDAO } from 'src/_common/dtos/user.dto';
import { LoginDTO } from 'src/_common/dtos/login.dto';
import { PasswordDTO } from 'src/_common/dtos/password.dto';
import { MailService } from 'src/_common/mail/mail.service';
import { ChangePasswordDTO } from 'src/_common/dtos/change-password.dto';
import { comparePassword } from 'src/_common/utils/password.compare';
import { bcryptPassword } from 'src/_common/utils/bcrypt-password';
import { IResult } from 'src/_common/interfaces/result.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async signup(newUser: UserDAO): Promise<User> {
    let { password } = newUser;

    const existUser: UserDAO = await this.usersRepository.findOne({
      where: { email: newUser.email },
    });
    if (existUser) throw new HttpException(['이미 존재하는 이메일입니다.'], HttpStatus.CONFLICT);

    password = await bcryptPassword(password);
    newUser.password = password;

    return await this.usersRepository.save(newUser);
  }

  async login(
    userInfo: LoginDTO
  ): Promise<{ accessToken: string; refreshToken: string; userName: string } | undefined> {
    const existUser: User = await this.usersRepository.findOne({ where: { email: userInfo.email } });
    if (!existUser)
      throw new HttpException(['존재하지 않은 이메일이거나 비밀번호가 틀렸습니다.'], HttpStatus.PRECONDITION_FAILED);
    const validatePassword = await comparePassword(userInfo.password, existUser.password);

    if (!validatePassword)
      throw new HttpException(['존재하지 않은 이메일이거나 비밀번호가 틀렸습니다.'], HttpStatus.PRECONDITION_FAILED);

    const accessToken = this.jwtService.sign(
      {
        id: existUser.id,
        email: existUser.email,
        name: existUser.name,
        profile_url: existUser.profile_url,
        phone_number: existUser.phone_number,
        phone_authentication: existUser.phone_authentication,
      },
      process.env.ACCESS_SECRET_KEY,
      process.env.ACCESS_EXPIRE_TIME
    );
    const refreshToken = this.jwtService.sign(
      { id: existUser.id },
      process.env.REFRESH_SECRET_KEY,
      process.env.REFRESH_EXPIRE_TIME
    );

    return { accessToken, refreshToken, userName: existUser.name };
  }

  async updateUserInfo(id: number, name: string, profileUrl: string): Promise<void> {
    await this.usersRepository.update({ id }, { name, profile_url: profileUrl });
  }

  async updatePassword(id: number, passwordDTO: PasswordDTO): Promise<void> {
    const existUser = await this.usersRepository.findOne({ where: { id } });

    const validPassword = await comparePassword(passwordDTO.currentPassword, existUser.password);
    if (!validPassword) throw new HttpException(['현재 비밀번호가 일치하지 않습니다.'], HttpStatus.FORBIDDEN);

    const validNewPassword = await comparePassword(passwordDTO.newPassword, existUser.password);
    if (validNewPassword)
      throw new HttpException(['바꾸려는 비밀번호가 현재 비밀번호와 일치합니다.'], HttpStatus.FORBIDDEN);

    const password = await bcryptPassword(passwordDTO.newPassword);
    await this.usersRepository.update({ id }, { password });
  }

  async findPassword(email: string): Promise<any> {
    const existUser = await this.usersRepository.findOne({ where: { email } });
    if (!existUser)
      throw new HttpException(['가입되지 않은 이메일입니다. 이메일을 확인해 주세요.'], HttpStatus.NOT_FOUND);

    return await this.mailService.sendEmail(email);
  }

  async changePassword(changePasswordDTO: ChangePasswordDTO): Promise<void> {
    const existUser = await this.usersRepository.findOne({ where: { email: changePasswordDTO.email } });

    const validNewPassword = await comparePassword(changePasswordDTO.password, existUser.password);
    if (validNewPassword)
      throw new HttpException(['바꾸려는 비밀번호가 기존 비밀번호와 일치합니다.'], HttpStatus.FORBIDDEN);

    let { password } = changePasswordDTO;
    password = await bcryptPassword(password);

    await this.usersRepository.update({ email: changePasswordDTO.email }, { password });
  }

  async findEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findUserByEmail(email: string): Promise<User> {
    const existUser = await this.usersRepository.findOne({ where: { email } });

    if (!existUser) throw new HttpException(['해당 유저를 찾을 수 없습니다'], HttpStatus.NOT_FOUND);

    return existUser;
  }

  async tokenValidateUser(userId: number) {
    return await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'phone_number', 'profile_url', 'phone_authentication'],
    });
  }

  async findUserById(id: number): Promise<User> {
    const existUser = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'profile_url'],
    });

    if (!existUser) throw new HttpException('해당 유저를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    return existUser;
  }

  // name으로만 조회
  async findUserByName(name: string) {
    return await this.usersRepository.findOneBy({ name });
  }

  async deleteAccount(id: number, password: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) throw new HttpException(['비밀번호가 일치하지 않습니다.'], HttpStatus.FORBIDDEN);

    await this.usersRepository.delete({ id });
  }

  async updateUserPhoneAuth(id: number, phoneNumber: string): Promise<void> {
    await this.usersRepository.update({ id }, { phone_authentication: true, phone_number: phoneNumber });
  }

  async searchPhoneNumber(id: number, phoneNumber: string): Promise<void> {
    const userAuthentication = await this.usersRepository.findOne({
      where: { id, phone_number: phoneNumber, phone_authentication: true },
    });
    if (userAuthentication)
      throw new HttpException(['이미 회원님께서 인증한 휴대폰 번호입니다.'], HttpStatus.FORBIDDEN);
    const existAuthentication = await this.usersRepository.findOne({
      where: { phone_number: phoneNumber, phone_authentication: true },
    });
    if (existAuthentication)
      throw new HttpException(['이미 다른 회원님께서 인증한 휴대폰 번호입니다.'], HttpStatus.FORBIDDEN);
  }

  async checkPhoneAuth(userId: number): Promise<IResult> {
    const checkAuth = await this.usersRepository.findOne({ where: { id: userId } });

    if (checkAuth.phone_authentication === false)
      throw new HttpException('핸드폰 인증이 필요한 서비스입니다. ', HttpStatus.UNAUTHORIZED);

    return { result: true };
  }
}
