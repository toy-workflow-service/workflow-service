import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, InvitationDto, SetRoleDto, UpdateWorkspaceDto } from 'src/_common/dtos/workspace.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { IResult } from 'src/_common/interfaces/result.interface';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { CheckMemberInterceptor } from 'src/_common/interceptors/check-member-interceptors';
import { CheckAdminInterceptor } from 'src/_common/interceptors/check-admin-interceptors';
import { CheckAuthInterceptor } from 'src/_common/interceptors/check-auth-interceptors';

@Controller('workspaces')
@UseInterceptors(CheckMemberInterceptor)
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
  @UseInterceptors(CheckAdminInterceptor)
  async updateWorkspace(@Body() body: UpdateWorkspaceDto, @Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.workspaceService.updateWorkspace(body, workspaceId);
  }

  @Delete(':workspaceId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async deleteWorkspace(@Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.workspaceService.deleteWorkspace(workspaceId);
  }

  @Post(':workspaceId/members')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAuthInterceptor)
  async inviteWorkspaceMember(
    @Body() body: InvitationDto,
    @Param('workspaceId') workspaceId: number,
    @GetUser() user: AccessPayload,
  ): Promise<IResult> {
    return await this.workspaceService.inviteWorkspaceMember(body, workspaceId, user.name);
  }

  @Patch(':workspaceId/:userId/role')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAuthInterceptor)
  async setMemberRole(
    @Body() body: SetRoleDto,
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
  ): Promise<IResult> {
    return await this.workspaceService.setMemberRole(body, workspaceId, userId);
  }

  @Post(':workspaceId/participation')
  async acceptInvitaion(@Param('workspaceId') workspaceId: number, @Req() req: Request): Promise<IResult> {
    const { email } = req.query;
    return await this.workspaceService.acceptInvitaion(workspaceId, email);
  }
}
