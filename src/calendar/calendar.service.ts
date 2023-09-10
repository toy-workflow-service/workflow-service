import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCalendarDto } from 'src/_common/dtos/calendar.dto';
import { Calendar } from 'src/_common/entities/calendar.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class CalendarsService {
  constructor(
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,
    private readonly userService: UsersService
  ) {}

  async GetCalendars(userId: number) {
    // const calendars = await this.calendarRepository.find();
    let calendars = await this.calendarRepository.find({ relations: ['user'] });
    calendars = calendars.filter((calendar) => {
      return calendar.user.id == userId;
    });
    return calendars.map((c) => {
      return {
        calendarId: c.id,
        title: c.title,
        description: c.description,
        deadline: c.deadline,
        startDate: c.start_date,
        type: c.type,
      };
    });
  }

  async GetCalendar(id: number) {
    const calendar = await this.calendarRepository.findOne({ where: { id } });

    return {
      calendarId: calendar.id,
      title: calendar.title,
      description: calendar.description,
      deadline: calendar.deadline,
      startDate: calendar.start_date,
      type: calendar.type,
    };
  }

  async PostCalendar(userId: number, data: CreateCalendarDto) {
    const user = this.userService.findUserById(userId);
    if (!user) throw new HttpException('해당 유저를 찾을 수 없습니다', HttpStatus.NOT_FOUND);
    await this.calendarRepository.insert({ ...data, user: { id: userId } });
    // await this.calendarRepository.insert({ ...data });
  }

  async DeleteCalendar(id: number) {
    const calendar = this.calendarRepository.findOneBy({ id });
    if (!calendar) throw new HttpException('해당 정보를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    await this.calendarRepository.delete({ id });
  }
}
