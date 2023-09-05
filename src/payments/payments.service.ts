import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipDto } from 'src/_common/dtos/membership.dto';
import { Payment } from 'src/_common/entities/payment.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { IResult } from 'src/_common/interfaces/result.interface';
import { MembershipsService } from 'src/memberships/memberships.service';
import { UsersService } from 'src/users/users.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private readonly membershipService: MembershipsService,
    private readonly userService: UsersService,
    private readonly workspaceService: WorkspacesService
  ) {}

  // 멤버십 결제
  async purchaseMembership(body: MembershipDto, workspaceId: number, userId: number): Promise<IResult> {
    const entityManager = this.paymentRepository.manager;

    await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
      const findUserById = await this.userService.findUserById(userId);

      if (findUserById.points < body.packagePrice)
        throw new HttpException('포인트가 부족합니다', HttpStatus.BAD_REQUEST);
      findUserById.points -= body.packagePrice;
      await transactionEntityManager.save(findUserById);

      const newPayment = this.paymentRepository.create({
        workspaceId,
        user: { id: userId },
      });
      await transactionEntityManager.save(newPayment);
      await this.membershipService.createMembership(body, workspaceId);
    });

    return { result: true };
  }

  // // 멤버십 연장
  // async extensionMembership(body: MembershipDto, workspaceId: number, userId: number): Promise<IResult> {
  //   const entityManager = this.paymentRepository.manager;

  //   try {
  //     await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
  //       const findUserById = await this.userService.findUserById(userId);

  //       if (findUserById.points < body.packagePrice)
  //         throw new HttpException('포인트가 부족합니다', HttpStatus.BAD_REQUEST);
  //       findUserById.points -= body.packagePrice;
  //       await transactionEntityManager.save(findUserById);

  //       const newPayment = this.paymentRepository.create({
  //         workspaceId,
  //         user: { id: userId },
  //       });
  //       await transactionEntityManager.save(newPayment);
  //       await this.membershipService.extensionMembership(body, workspaceId);
  //     });
  //     return { result: true };
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // 결제 취소
  async cancelPurchase(workspaceId: number, paymentId: number, userId: number): Promise<Object> {
    const entityManager = this.paymentRepository.manager;

    const targetPayment = await this.paymentRepository.findOne({
      where: { id: paymentId, workspaceId, user: { id: userId } },
    });
    if (!targetPayment) throw new HttpException('해당 결제 내역을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);

    const targetMembership = await this.membershipService.getMyMembership(workspaceId);

    const milliSecondPerDay = 24 * 60 * 60 * 1000;
    const refundRequestDate = new Date();

    // 남은기간 계산
    const remainingTime = targetMembership.end_date.getTime() - refundRequestDate.getTime();
    const remainingDays = Math.floor(remainingTime / milliSecondPerDay);

    // 멤버십 금액의 일할 계산
    const membershipPeriod = targetMembership.end_date.getTime() - targetMembership.created_at.getTime();
    const daysInMembership = Math.floor(membershipPeriod / milliSecondPerDay);

    const dailyPrice = Math.floor(targetMembership.package_price / daysInMembership);
    const refundPrice = Math.floor(remainingDays) * dailyPrice;
    const roundedRefundPrice = Math.floor(refundPrice / 100) * 100;

    await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
      await this.membershipService.cancelMembership(workspaceId);

      targetPayment.status = false;
      await transactionEntityManager.save(targetPayment);

      const user = await this.userService.findUserById(userId);
      const refundPoint = roundedRefundPrice;
      const remainPoint = (user.points += refundPoint);
      await transactionEntityManager.save(User, { ...user, points: remainPoint });
    });
    return { remainingDays, roundedRefundPrice };
  }

  // 나의 결제내역 조회
  async getMyPayments(userId: number): Promise<Payment[]> {
    const payments = await this.paymentRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
    const paymentHistory = [];
    for (const payment of payments) {
      const workspaceId = payment.workspaceId;
      const status = payment.status;
      const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);

      if (workspace.memberships.length > 0 && status === true) {
        const membership = workspace.memberships[0];
        const paymentInfo = {
          paymentId: payment.id,
          paymentCreatedAt: payment.created_at,
          workspaceId,
          workspaceName: workspace.name,
          membershipCreatedAt: membership.created_at,
          membershipEndDate: membership.end_date,
          membershipPrice: membership.package_price,
        };
        paymentHistory.push(paymentInfo);
      } else {
        const paymentInfo = {
          paymentId: payment.id,
          paymentCreatedAt: payment.created_at,
          workspaceId,
          workspaceName: workspace.name,
        };
        paymentHistory.push(paymentInfo);
      }
    }
    return paymentHistory;
  }
}
