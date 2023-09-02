import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipDto } from 'src/_common/dtos/membership.dto';
import { Payment } from 'src/_common/entities/payment.entity';
import { User } from 'src/_common/entities/user.entitiy';
import { IResult } from 'src/_common/interfaces/result.interface';
import { MembershipsService } from 'src/memberships/memberships.service';
import { UsersService } from 'src/users/users.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private readonly membershipService: MembershipsService,
    private readonly userService: UsersService
  ) {}

  // 멤버십 결제
  async purchaseMembership(body: MembershipDto, workspaceId: number, userId: number): Promise<IResult> {
    const entityManager = this.paymentRepository.manager;
    try {
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
    } catch (err) {
      console.error(err);
    }
  }

  // 멤버십 연장
  async extensionMembership(body: MembershipDto, workspaceId: number, userId: number): Promise<IResult> {
    const entityManager = this.paymentRepository.manager;

    try {
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
        await this.membershipService.extensionMembership(body, workspaceId);
      });
      return { result: true };
    } catch (err) {
      console.error(err);
    }
  }

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

    try {
      await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
        await this.membershipService.cancelMembership(workspaceId);

        targetPayment.status = false;
        await transactionEntityManager.save(targetPayment);

        const user = await this.userService.findUserById(userId);
        const refundPoint = refundPrice;
        const remainPoint = (user.points += refundPoint);
        await transactionEntityManager.save(User, { ...user, points: remainPoint });
      });
      return { remainingDays, refundPrice };
    } catch (err) {
      console.error(err);
    }
  }

  // 나의 결제내역 조회
  async getMyPayments(userId: number): Promise<Payment[]> {
    const payments = await this.paymentRepository.find({ where: { user: { id: userId } } });

    if (!payments) throw new HttpException('결제 내역이 없습니다.', HttpStatus.NOT_FOUND);

    return payments;
  }
}
