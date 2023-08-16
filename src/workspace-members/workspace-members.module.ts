import { Module } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';

@Module({
  controllers: [WorkspaceMembersController],
  providers: [WorkspaceMembersService],
})
export class WorkspaceMembersModule {}
