import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  Res,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCalendarDto, UpdateCalendarDto } from 'src/_common/dtos/calendar.dto';
import { CalendarsService } from './calendar.service';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { Response } from 'express';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { CheckAuthInterceptor } from 'src/_common/interceptors/check-auth-interceptors';

@Controller('calendars')
export class CalendarController {
  constructor(private readonly calendarsService: CalendarsService) {}

  //캘린더 전체 조회
  @Get()
  @UseGuards(AuthGuard)
  async GetCalendars(@GetUser() user: AccessPayload) {
    return await this.calendarsService.GetCalendars(user.id);
  }

  //캘린더 상세 조회
  @Get(':calendarId')
  async GetCalendar(@Param('calendarId') calendarId: number) {
    return await this.calendarsService.GetCalendar(calendarId);
  }

  //캘린더 생성
  @Post()
  @UseGuards(AuthGuard)
  async PostCalendar(@GetUser() user: AccessPayload, @Body() data: CreateCalendarDto, @Res() res: Response) {
    await this.calendarsService.PostCalendar(user.id, data);

    return res.status(HttpStatus.CREATED).json({ message: '생성하였습니다.' });
  }

  //캘린더 수정
  @Put(':calendarId')
  @UseGuards(AuthGuard)
  async UpdateCalendar(@Param('calendarId') calendarId: number, @Body() data: UpdateCalendarDto, @Res() res: Response) {
    await this.calendarsService.UpdateCalendar(calendarId, data);

    return res.status(HttpStatus.OK).json({ message: '수정하였습니다.' });
  }

  //캘린더 삭제
  @Delete(':calendarId')
  @UseGuards(AuthGuard)
  async DeleteCalendar(@Param('calendarId') calendarId: number, @Res() res: Response) {
    await this.calendarsService.DeleteCalendar(calendarId);

    return res.status(HttpStatus.OK).json({ message: '삭제하였습니다.' });
  }
}
