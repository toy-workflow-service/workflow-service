import { Module } from '@nestjs/common';
import { SMSService } from './sms.service';
import { SMSController } from './sms.controller';

@Module({
  controllers: [SMSController],
  providers: [SMSService],
  exports: [SMSService],
})
export class SMSModule {}
