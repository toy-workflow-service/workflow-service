import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';

@Module({
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
