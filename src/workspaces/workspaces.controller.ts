import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from 'src/_common/dtos/workspace.dto';

@Controller('workspaces')
// @UseInterceptors(CheckPhoneAuthInterceptor)
export class WorkspacesController {
  constructor(private readonly workspaceService: WorkspacesService) {}

  @Post()
  async createWorkspace(@Body() body: CreateWorkspaceDto, @Req() req: Request) {
    const { userId } = req.user;
    await this.workspaceService.createWorkspace(body, userId);
  }
}
