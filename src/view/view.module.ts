import { Module } from '@nestjs/common';
import { ViewController } from './view.controller';
import { ViewService } from './view.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/_common/entities/user.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ViewController],
  providers: [ViewService],
})
export class ViewModule {}
