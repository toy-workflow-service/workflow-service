import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { MulterRequest } from 'src/_common/interfaces/multer-request.interface';
import { Request, Response } from 'express';
import { SignUpDTO } from 'src/_common/dtos/signup.dto';
import { LoginDTO } from 'src/_common/dtos/login.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { JwtService } from 'src/_common/security/jwt/jwt.service';
import { RedisCacheService } from 'src/_common/cache/redis.service';
import { UpdateInfoDTO } from 'src/_common/dtos/update-info.dto';
import { PasswordDTO } from 'src/_common/dtos/password.dto';
import { EmailDTO } from 'src/_common/dtos/email.dto';
import { ChangePasswordDTO } from 'src/_common/dtos/change-password.dto';
import { SocialSignUpDTO } from 'src/_common/dtos/social-signup.dto';
import { UserDAO } from 'src/_common/dtos/user.dto';
import { SocialSignupPipe } from 'src/_common/pipes/social-signup.pipe';
import { uuid } from 'uuidv4';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cacheManager: RedisCacheService,
  ) {}

  @Post('signup')
  async signup(@Body() userDTO: SignUpDTO, @Req() req: MulterRequest, @Res() res: Response): Promise<Object> {
    const profileUrl = req.file ? req.file.location : null;
    userDTO.profile_url = profileUrl;

    await this.usersService.signup(userDTO);
    return res.status(HttpStatus.CREATED).json({ message: '회원가입이 완료되었습니다.' });
  }

  // 소셜 로그인의 회원가입
  @Post('socialSignup')
  async socialSignup(@Body(SocialSignupPipe) user: SocialSignUpDTO, @Res() res: Response): Promise<Object> {
    const userData = await this.cacheManager.get(user.tempId);
    if (!userData)
      throw new HttpException('제한 시간이 초과되었습니다. 다시 소셜 로그인 해주세요. ', HttpStatus.BAD_REQUEST);

    const userInfo = userData.split(' ');
    const userDAO: UserDAO = {
      email: userInfo[0],
      name: userInfo[1],
      profile_url: userInfo[2],
      phone_number: user.phoneNumber,
      password: uuid(),
    };

    await this.usersService.signup(userDAO);
    return res.status(HttpStatus.CREATED).json({ message: '회원가입이 완료되었습니다.' });
  }

  @Post('login')
  async loginAccount(@Body() LoginDTO: LoginDTO, @Res() res: Response): Promise<Object> {
    const { accessToken, refreshToken, userName } = await this.usersService.login(LoginDTO);

    res.setHeader('authorization', `Bearer ${accessToken}`);
    res.cookie('refreshToken', refreshToken);

    return res.status(HttpStatus.OK).json({ message: `${userName}님 환영합니다. ` });
  }

  @Get('userInfo')
  @UseGuards(AuthGuard)
  async getUserInfo(@GetUser() user: AccessPayload, @Res() res: Response): Promise<Object> {
    return res.status(HttpStatus.OK).json({ user });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res() res: Response): Promise<Object> {
    const token = req.header('authorization').split(' ')[1];
    const newDate: number = Date.now() / 1000;
    const { exp } = this.jwtService.verify(token, process.env.ACCESS_SECRET_KEY);
    const expireTime = Math.ceil(exp - newDate);

    await this.cacheManager.set(token, 'blackList', expireTime);
    res.clearCookie('refreshToken');

    return res.status(HttpStatus.OK).json({ message: '로그아웃 하셨습니다.' });
  }

  //이름은 정보수정 시, 프론트에서 자동으로 이름을 불러오는 것으로 구현 해야 함
  @Patch()
  @UseGuards(AuthGuard)
  async updateUserInfo(
    @GetUser() user: AccessPayload,
    @Req() req: MulterRequest,
    @Body() updateInfo: UpdateInfoDTO,
    @Res() res: Response,
  ): Promise<Object> {
    const profileUrl = req.file ? req.file.location : user.profile_url;

    await this.usersService.updateUserInfo(user.id, updateInfo.name, profileUrl);
    return res.status(HttpStatus.OK).json({ message: '회원 정보가 수정되었습니다. ' });
  }

  @Patch('password')
  @UseGuards(AuthGuard)
  async updatePassword(
    @GetUser() user: AccessPayload,
    @Req() req: Request,
    @Body() passwordDTO: PasswordDTO,
    @Res() res: Response,
  ): Promise<Object> {
    await this.usersService.updatePassword(user.id, passwordDTO);
    const token = req.header('authorization').split(' ')[1];
    const newDate: number = Date.now() / 1000;
    const { exp } = this.jwtService.verify(token, process.env.ACCESS_SECRET_KEY);
    const expireTime = Math.ceil(exp - newDate);
    await this.cacheManager.set(token, 'blackList', expireTime);
    res.clearCookie('refreshToken');

    return res.status(HttpStatus.OK).json({ message: '비밀번호가 변경 되었습니다. 다시 로그인해 주세요. ' });
  }

  @Post('password/findPassword')
  async findPassword(@Body() email: EmailDTO, @Res() res: Response): Promise<Object> {
    const { code, expireTime } = await this.usersService.findPassword(email.email);
    return res
      .status(HttpStatus.OK)
      .json({ message: '해당 이메일로 인증 번호를 보내드렸습니다. 확인해 주세요.', code, expireTime });
  }

  // 비밀번호 찾기 후 이메일 인증에 성공했을 때 호출되는 API
  @Post('password/changePassword')
  async changePassword(@Body() changePasswordDTO: ChangePasswordDTO, @Res() res: Response): Promise<Object> {
    await this.usersService.changePassword(changePasswordDTO);
    return res.status(HttpStatus.OK).json({ message: '비밀번호가 변경 되었습니다. ' });
  }
}
