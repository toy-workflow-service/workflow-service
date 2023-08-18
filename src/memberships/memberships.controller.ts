import { Body, Controller, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { MembershipDto } from 'src/_common/dtos/membership.dto';
import { CheckAdminInterceptor } from 'src/_common/interceptors/check-admin-interceptors';
import { IResult } from 'src/_common/interfaces/result.interface';
import { Cron } from '@nestjs/schedule';

@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipService: MembershipsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async createMembership(@Body() body: MembershipDto, @Param('workspaceId') workspaceId: number): Promise<IResult> {
    return await this.membershipService.createMembership(body, workspaceId);
  }

  @Cron('0 0 * * *')
  async deleteExpiredMembership(): Promise<IResult> {
    return await this.membershipService.deleteExpiredMembership();
  }
}
