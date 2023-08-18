import { Body, Controller, Delete, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { CheckAdminInterceptor } from 'src/_common/interceptors/check-admin-interceptors';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { IResult } from 'src/_common/interfaces/result.interface';
import { MembershipDto } from 'src/_common/dtos/membership.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  // 결제
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async purchaseMembership(
    @Body() body: MembershipDto,
    @Param('workspaceId') workspaceId: number,
    @GetUser() user: AccessPayload,
  ): Promise<IResult> {
    return await this.paymentService.purchaseMembership(body, workspaceId, user.id);
  }

  // 결제 연장
  @Post('extension')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async extensionMembership(
    @Body() body: MembershipDto,
    @Param('workspaceId') workspaceId: number,
    @GetUser() user: AccessPayload,
  ): Promise<IResult> {
    return await this.paymentService.extensionMembership(body, workspaceId, user.id);
  }

  // 결제 취소
  @Delete(':paymentId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async cancelPurchase(
    @Param('workspaceId') workspaceId: number,
    @Param('paymentId') paymentId: number,
    @GetUser() user: AccessPayload,
  ): Promise<Object> {
    return await this.paymentService.cancelPurchase(workspaceId, paymentId, user.id);
  }
}
