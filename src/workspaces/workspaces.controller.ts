import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspaceService: WorkspacesService) {}

  // 워크스페이스 생성
  @Post()
  @UseGuards(AuthGuard)
  async createWorkspace(@Body() body: CreateWorkspaceDto, @GetUser() user: AccessPayload): Promise<IResult> {
    return await this.workspaceService.createWorkspace(body, user.id);
  }

  // 워크스페이스 전체 조회
  @Get()
  @UseInterceptors(CheckMemberInterceptor)
  @UseGuards(AuthGuard)
  async getAllWorkspaces(): Promise<Workspace[]> {
    return await this.workspaceService.getAllWorkspaces();
  }

  // 워크스페이스 상세 조회
  @Get(':workspaceId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckMemberInterceptor)
  async getWorkspaceDetail(@Param('workspaceId') workspaceId: number): Promise<Workspace> {
    return await this.workspaceService.getWorkspaceDetail(workspaceId);
  }

  // 워크스페이스 수정
  @Patch(':workspaceId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async updateWorkspace(@Body() body: UpdateWorkspaceDto, @Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.workspaceService.updateWorkspace(body, workspaceId);
  }

  // 워크스페이스 삭제
  @Delete(':workspaceId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async deleteWorkspace(@Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.workspaceService.deleteWorkspace(workspaceId);
  }

  // 워크스페이스 멤버초대
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

  // 워크스페이스 멤버역할 변경
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

  // 워크스페이스 참여자 상태변경, 이메일에서 수락버튼 클릭 시 실행
  @Post(':workspaceId/participation')
  async acceptInvitaion(@Param('workspaceId') workspaceId: number, @Req() req: Request): Promise<IResult> {
    const { email } = req.query;
    return await this.workspaceService.acceptInvitaion(workspaceId, email);
  }

  @Get(':workspaceId/members/search')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckMemberInterceptor)
  async searchMemberByName(
    @Param('workspaceId') workspaceId: number,
    @Query('name') name: string,
  ): Promise<Workspace_Member> {
    return await this.workspaceService.searchMemberByName(workspaceId, name);
  }
}
