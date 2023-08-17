import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cacheManager: RedisCacheService,
  ) {}

  @Post('signup')
  async signup(@Body() UserDTO: SignUpDTO, @Req() req: MulterRequest, @Res() res: Response): Promise<Object> {
    const profileUrl = req.file ? req.file.location : null;
    UserDTO.profile_url = profileUrl;

    await this.usersService.signup(UserDTO);
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
  getUserInfo(@GetUser() user: AccessPayload, @Res() res: Response): Object {
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
}
