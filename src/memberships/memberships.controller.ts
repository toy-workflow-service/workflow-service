import { Body, Controller, Delete, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { MembershipDto } from 'src/_common/dtos/membership.dto';
import { CheckAdminInterceptor } from 'src/_common/interceptors/check-admin-interceptors';
import { IResult } from 'src/_common/interfaces/result.interface';
import { Cron } from '@nestjs/schedule';

@Controller('workspaces/:workspaceId/membership')
export class MembershipsController {
  constructor(private readonly membershipService: MembershipsService) {}

  // 멤버십 등록
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async createMembership(@Body() body: MembershipDto, @Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.membershipService.createMembership(body, workspaceId);
  }

  // Task Schheduling, 매일 자정에 아래의 api가 백엔드에서 자동 실행
  @Cron('0 0 * * *')
  async deleteExpiredMembership(): Promise<IResult> {
    return await this.membershipService.deleteExpiredMembership();
  }

  // 멤버십 기간 연장
  @Patch()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async extensionMembership(@Body() body: MembershipDto, @Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.membershipService.extensionMembership(body, workspaceId);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async cancelMembership(@Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.membershipService.cancelMembership(workspaceId);
  }
}
