import { Controller } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';

@Controller('workspace-members')
export class WorkspaceMembersController {
  constructor(private readonly workspaceMembersService: WorkspaceMembersService) {}
}
