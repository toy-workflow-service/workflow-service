import { Module } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';

@Module({
  providers: [WorkspaceMembersService]
})
export class WorkspaceMembersModule {}
