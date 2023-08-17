import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, InvitationDto, SetRoleDto, UpdateWorkspaceDto } from 'src/_common/dtos/workspace.dto';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { IResult } from 'src/_common/interfaces/result.interface';
import { Workspace } from 'src/_common/entities/workspace.entity';

@Controller('workspaces')
// @UseInterceptors(CheckPhoneAuthInterceptor)
export class WorkspacesController {
  constructor(private readonly workspaceService: WorkspacesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createWorkspace(@Body() body: CreateWorkspaceDto, @GetUser() user: AccessPayload): Promise<IResult> {
    return await this.workspaceService.createWorkspace(body, user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllWorkspaces(): Promise<Workspace[]> {
    return await this.workspaceService.getAllWorkspaces();
  }

  @Get(':workspaceId')
  @UseGuards(AuthGuard)
  async getWorkspaceDetail(@Param('workspaceId') workspaceId: number): Promise<Workspace> {
    return await this.workspaceService.getWorkspaceDetail(workspaceId);
  }

  @Patch(':workspaceId')
  @UseGuards(AuthGuard)
  async updateWorkspace(@Body() body: UpdateWorkspaceDto, @Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.workspaceService.updateWorkspace(body, workspaceId);
  }

  @Delete(':workspaceId')
  @UseGuards(AuthGuard)
  async deleteWorkspace(@Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.workspaceService.deleteWorkspace(workspaceId);
  }

  @Post(':workspaceId/members')
  @UseGuards(AuthGuard)
  async inviteWorkspaceMember(
    @Body() body: InvitationDto,
    @Param('workspaceId') workspaceId: number,
    @GetUser() user: AccessPayload,
  ): Promise<IResult> {
    return await this.workspaceService.inviteWorkspaceMember(body, workspaceId, user.name);
  }

  @Patch(':workspaceId/:userId/role')
  @UseGuards(AuthGuard)
  async setMemberRole(
    @Body() body: SetRoleDto,
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
  ): Promise<IResult> {
    return await this.workspaceService.setMemberRole(body, workspaceId, userId);
  }
}
