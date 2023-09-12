import { Body, Controller, Delete, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from 'src/_common/security/auth.guard';
import { CheckAdminInterceptor } from 'src/_common/interceptors/check-admin-interceptors';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { AccessPayload } from 'src/_common/interfaces/access-payload.interface';
import { IResult } from 'src/_common/interfaces/result.interface';
import { MembershipDto } from 'src/_common/dtos/membership.dto';
import { Cron } from '@nestjs/schedule';

@Controller('workspaces/:workspaceId/payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  // 멤버십결제
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async purchaseMembership(
    @Body() body: MembershipDto,
    @Param('workspaceId') workspaceId: number,
    @GetUser() user: AccessPayload
  ): Promise<IResult> {
    return await this.paymentService.purchaseMembership(body, workspaceId, user.id);
  }

  // 결제 취소
  @Delete(':paymentId')
  @UseGuards(AuthGuard)
  @UseInterceptors(CheckAdminInterceptor)
  async cancelPurchase(
    @Param('workspaceId') workspaceId: number,
    @Param('paymentId') paymentId: number,
    @GetUser() user: AccessPayload
  ): Promise<Object> {
    return await this.paymentService.cancelPurchase(workspaceId, paymentId, user.id);
  }

  // 결제일로부터 7개월이 지난 결제내역 삭제
  @Cron('0 0 * * *')
  async deletePaymentHistory(): Promise<IResult> {
    return await this.paymentService.deletePaymentHistory();
  }
}
