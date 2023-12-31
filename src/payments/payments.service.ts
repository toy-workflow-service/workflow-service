import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipDto } from 'src/_common/dtos/membership.dto';
import { Payment } from 'src/_common/entities/payment.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { IResult } from 'src/_common/interfaces/result.interface';
import { MembershipsService } from 'src/memberships/memberships.service';
import { UsersService } from 'src/users/users.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { EntityManager, LessThan, Repository } from 'typeorm';

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

  // 포인트 충전
  async chargePoint(amount: number, userId: number): Promise<IResult> {
    const entityManager = this.paymentRepository.manager;
    const user = await this.userService.findUserById(userId);
    if (!user) throw new HttpException('해당 유저를 찾을 수 없습니다', HttpStatus.NOT_FOUND);

    await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
      user.points += Number(amount);
      await transactionEntityManager.save(user);

      const newPayment = this.paymentRepository.create({
        amount,
        workspaceId: 0,
        user: { id: user.id },
      });
      await transactionEntityManager.save(newPayment);
    });
    return { result: true };
  }

  // 멤버십결제 취소
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

  // 유저 포인트 결제 취소
  async cancelChargePoint(amount: number, userId: number, paymentId: number): Promise<IResult> {
    const entityManager = this.paymentRepository.manager;
    await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
      const targetPayment = await this.paymentRepository.findOne({
        where: { id: paymentId, user: { id: userId } },
      });
      if (!targetPayment) throw new HttpException('해당 결제 내역을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);

      targetPayment.status = false;
      await transactionEntityManager.save(targetPayment);

      const user = await this.userService.findUserById(userId);
      const refundPoint = Number(amount);
      user.points -= refundPoint;
      await transactionEntityManager.save(user);
    });

    return { result: true };
  }

  // 포인트 결제 내역
  async getMyPointHistory(userId: number): Promise<Payment[]> {
    const payment = await this.paymentRepository.find({
      where: { user: { id: userId }, workspaceId: 0 },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return payment;
  }

  // 멤버십 결제내역 조회
  async getMyMembershipHistory(userId: number): Promise<Payment[]> {
    const payments = await this.paymentRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
    const paymentHistory = [];
    for (const payment of payments) {
      const workspaceId = payment.workspaceId;
      const status = payment.status;

      if (workspaceId === 0) {
        continue;
      }

      const workspace = await this.workspaceService.getWorkspaceDetail(workspaceId);

      if (workspace) {
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
      } else {
        const paymentInfo = {
          paymentId: payment.id,
          paymentCreatedAt: payment.created_at,
          workspaceId: payment.workspaceId,
          workspaceName: null,
        };
        paymentHistory.push(paymentInfo);
      }
    }
    return paymentHistory;
  }

  // 결제일로부터 7개월이 지난 결제내역 삭제
  async deletePaymentHistory(): Promise<IResult> {
    const currentDate = new Date();
    const sevenMonthAgo = new Date();
    sevenMonthAgo.setMonth(currentDate.getMonth() - 7);

    const paymentHistory = await this.paymentRepository.find({
      where: {
        created_at: LessThan(sevenMonthAgo),
      },
    });

    await this.paymentRepository.remove(paymentHistory);

    return { result: true };
  }
}
