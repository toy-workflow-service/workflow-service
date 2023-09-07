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
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, InvitationDto, SetRoleDto, UpdateWorkspaceDto } from 'src/_common/dtos/workspace.dto';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { IResult } from 'src/_common/interfaces/result.interface';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { CheckMemberInterceptor } from 'src/_common/interceptors/check-member-interceptors';
import { CheckAdminInterceptor } from 'src/_common/interceptors/check-admin-interceptors';
import { CheckAuthInterceptor } from 'src/_common/interceptors/check-auth-interceptors';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { CheckPhoneAuthInterceptor } from 'src/_common/interceptors/check-phone-auth-interceptors';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspaceService: WorkspacesService) {}

  // 워크스페이스 생성
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckPhoneAuthInterceptor)
  async createWorkspace(@Body() body: CreateWorkspaceDto, @GetUser() user: AccessPayload): Promise<IResult> {
    return await this.workspaceService.createWorkspace(body, user.id);
  }

  // 워크스페이스 전체 조회
  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckMemberInterceptor)
  async getMyWorkspaces(@GetUser() user: AccessPayload): Promise<Workspace[]> {
    return await this.workspaceService.getMyWorkspaces(user.id);
  }

  // 워크스페이스 상세 조회
  @Get(':workspaceId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckMemberInterceptor)
  async getWorkspaceDetail(@GetUser() user: AccessPayload, @Param('workspaceId') workspaceId: number): Promise<Object> {
    const data = await this.workspaceService.getWorkspaceDetail(workspaceId);
    const loginUserRole = await this.workspaceService.loginUserRole(user.id, workspaceId);

    return { data, userId: user.id, userName: user.name, loginUserRole };
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
    @GetUser() user: AccessPayload
  ): Promise<IResult> {
    return await this.workspaceService.inviteWorkspaceMember(body, workspaceId, user.name, user.id);
  }

  // 워크스페이스 멤버 삭제
  @Delete(':workspaceId/member/:userId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAuthInterceptor)
  async deleteWorkspaceMember(
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
    @GetUser() user: AccessPayload
  ): Promise<IResult> {
    const loginUser = user;
    return await this.workspaceService.deleteWorkspaceMember(workspaceId, userId, loginUser.name, loginUser.id);
  }

  // 워크스페이스 멤버역할 변경
  @Patch(':workspaceId/:userId/role')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAuthInterceptor)
  async setMemberRole(
    @Body() body: SetRoleDto,
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
    @GetUser() user: AccessPayload
  ): Promise<IResult> {
    const loginUser = user;
    return await this.workspaceService.setMemberRole(body, workspaceId, userId, loginUser.name, loginUser.id);
  }

  // 워크스페이스 참여자 상태변경, 이메일에서 수락버튼 클릭 시 실행
  @Post(':workspaceId/participation')
  async acceptInvitaion(@Param('workspaceId') workspaceId: number, @Req() req: Request, @Res() res: Response) {
    const { email } = req.query;
    await this.workspaceService.acceptInvitaion(workspaceId, email);
    return res.redirect('/login');
  }

  @Get(':workspaceId/members/search')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckMemberInterceptor)
  async searchMemberByName(
    @Param('workspaceId') workspaceId: number,
    @Query('name') name: string
  ): Promise<Workspace_Member> {
    return await this.workspaceService.searchMemberByName(workspaceId, name);
  }

  // 워크스페이스가 보유한 전체 보드 개수 조회
  @Get(':workspaceId/boards/count')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckMemberInterceptor)
  async countWorkspaceBoards(@Param('workspaceId') workspaceId: number): Promise<Object> {
    return await this.workspaceService.countWorkspaceBoards(workspaceId);
  }

  // 워크스페이스에 업로드된 모든 파일 조회
  @Get(':workspaceId/getFiles')
  @UseGuards(AuthGuard)
  async getAllfiles(@Param('workspaceId') workspaceId: number): Promise<File[]> {
    const allFiles = await this.workspaceService.getAllFiles(workspaceId);
    return allFiles;
  }
}
