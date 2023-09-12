import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { deletePasswordDTO } from 'src/_common/dtos/delete-password.dto';
import { PhoneNumberDTO } from 'src/_common/dtos/phone.dto';
import { Payment } from 'src/_common/entities/payment.entity';
import { PaymentsService } from 'src/payments/payments.service';
import { IResult } from 'src/_common/interfaces/result.interface';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cacheManager: RedisCacheService,
    private readonly paymentService: PaymentsService
  ) {}

  @Post('signup')
  async signup(@Body() userDTO: SignUpDTO, @Req() req: MulterRequest, @Res() res: Response): Promise<Object> {
    if (!userDTO.emailAuth)
      throw new HttpException(['이메일이 인증되지 않았습니다. 이메일 인증을 해주세요. '], HttpStatus.BAD_REQUEST);

    const profileUrl = req.file ? req.file.location : null;
    userDTO.profile_url = profileUrl;

    await this.usersService.signup(userDTO);
    return res.status(HttpStatus.CREATED).json({ message: '회원가입이 완료되었습니다.' });
  }

  @Post('login')
  async loginAccount(@Body() LoginDTO: LoginDTO, @Res() res: Response): Promise<Object> {
    const { accessToken, refreshToken, userName } = await this.usersService.login(LoginDTO);

    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

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
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(HttpStatus.OK).json({ message: '로그아웃 하셨습니다.' });
  }

  @Patch('updateProfileImage')
  @UseGuards(AuthGuard)
  async updateProfileImage(@GetUser() user: AccessPayload, @Req() req: MulterRequest) {
    const profileUrl = req.file ? req.file.location : user.profile_url;

    await this.usersService.updateProfileImage(user.id, profileUrl);
    return true;
  }

  @Patch()
  @UseGuards(AuthGuard)
  async updateUserInfo(
    @GetUser() user: AccessPayload,
    @Body() updateInfo: UpdateInfoDTO,
    @Res() res: Response
  ): Promise<Object> {
    if (user.email !== updateInfo.email)
      throw new HttpException(
        ['이메일이 일치하지 않습니다. 현재 로그인된 이메일을 입력해 주세요. '],
        HttpStatus.BAD_REQUEST
      );

    await this.usersService.updateUserInfo(user.id, updateInfo.name);
    return res.status(HttpStatus.OK).json({ message: '회원 정보가 수정되었습니다. ' });
  }

  @Patch('password')
  @UseGuards(AuthGuard)
  async updatePassword(
    @GetUser() user: AccessPayload,
    @Req() req: Request,
    @Body() passwordDTO: PasswordDTO,
    @Res() res: Response
  ): Promise<Object> {
    await this.usersService.updatePassword(user.id, passwordDTO);
    const token = req.header('authorization').split(' ')[1];
    const newDate: number = Date.now() / 1000;
    const { exp } = this.jwtService.verify(token, process.env.ACCESS_SECRET_KEY);
    const expireTime = Math.ceil(exp - newDate);
    await this.cacheManager.set(token, 'blackList', expireTime);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(HttpStatus.OK).json({ message: '비밀번호가 변경 되었습니다. 다시 로그인해 주세요. ' });
  }

  @Post('password/findPassword')
  async findPassword(@Body() email: EmailDTO, @Res() res: Response): Promise<Object> {
    const { code, expireTime } = await this.usersService.findPassword(email.email);
    return res.status(HttpStatus.OK).json({ message: '해당 이메일로 인증 번호를 보내드렸습니다. ', code, expireTime });
  }

  // 비밀번호 찾기 후 이메일 인증에 성공했을 때 호출되는 API
  @Post('password/changePassword')
  async changePassword(@Body() changePasswordDTO: ChangePasswordDTO, @Res() res: Response): Promise<Object> {
    if (!changePasswordDTO.emailAuth)
      throw new HttpException(['이메일이 인증되지 않았습니다. 이메일 인증을 해주세요. '], HttpStatus.BAD_REQUEST);

    await this.usersService.changePassword(changePasswordDTO);
    return res.status(HttpStatus.OK).json({ message: '비밀번호가 변경 되었습니다. 로그인 창으로 이동합니다. ' });
  }

  @Delete()
  @UseGuards(AuthGuard)
  async deleteAccount(
    @GetUser() user: AccessPayload,
    @Body() passwordDTO: deletePasswordDTO,
    @Res() res: Response
  ): Promise<Object> {
    await this.usersService.deleteAccount(user.id, passwordDTO.password);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(HttpStatus.OK).json({ message: '계정이 삭제되었습니다. 홈 화면으로 이동합니다. ' });
  }

  @Post('phoneAuthentication')
  @UseGuards(AuthGuard)
  async updateUserPhoneAuth(
    @Body() PhoneNumberDTO: PhoneNumberDTO,
    @GetUser() user: AccessPayload,
    @Res() res: Response
  ): Promise<any> {
    await this.usersService.updateUserPhoneAuth(user.id, PhoneNumberDTO.phoneNumber);
    return res.status(HttpStatus.OK).json({ message: '휴대폰 본인 인증에 성공하셨습니다. ' });
  }

  // 포인트충전
  @Post('point/charge')
  @UseGuards(AuthGuard)
  async chargePoint(@Body('amount') amount: number, @GetUser() user: AccessPayload): Promise<IResult> {
    return await this.paymentService.chargePoint(amount, user.id);
  }

  // 멤버십 결제내역 조회
  @Get('payments/membership/history')
  @UseGuards(AuthGuard)
  async getMyMembershipHistory(@GetUser() user: AccessPayload): Promise<Object> {
    const result = await this.paymentService.getMyMembershipHistory(user.id);
    return { data: result, userName: user.name, userEmail: user.email };
  }

  // 포인트 결제내역 조회
  @Get('payments/point/history')
  @UseGuards(AuthGuard)
  async getMyPointHistory(@GetUser() user: AccessPayload): Promise<Payment[]> {
    return await this.paymentService.getMyPointHistory(user.id);
  }

  // 포인트 결제 취소
  @Delete('payments/point/:paymentId')
  @UseGuards(AuthGuard)
  async cancelChargePoint(
    @Body('amount') amount: number,
    @Param('paymentId') paymentId: number,
    @GetUser() user: AccessPayload
  ): Promise<IResult> {
    return await this.paymentService.cancelChargePoint(amount, user.id, paymentId);
  }

  @Get('searchEmail/:email')
  async searchEmail(@Param('email') email: string, @Res() res: Response): Promise<Object> {
    const user = await this.usersService.findEmail(email);
    return res.status(HttpStatus.OK).json({ user });
  }

  @Get('findUser/:userId')
  async searchUser(@Param('userId') userId: number, @Res() res: Response): Promise<Object> {
    const user = await this.usersService.findUserById(userId);
    return res.status(HttpStatus.OK).json({ user });
  }
}
