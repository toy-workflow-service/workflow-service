import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipDto } from 'src/_common/dtos/membership.dto';
import { Membership } from 'src/_common/entities/membership.entity';
import { IResult } from 'src/_common/interfaces/result.interface';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
  ) {}

  // 멤버십 생성
  async createMembership(body: MembershipDto, workspaceId: number): Promise<IResult> {
    const startDate = new Date();
    const servicePeriod = body.servicePeriod * 24 * 60 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + servicePeriod);

    const existMembership = await this.membershipRepository.findOne({ where: { workspace: { id: workspaceId } } });
    if (existMembership) throw new HttpException('이미 멤버십 결제가 되어있습니다.', HttpStatus.CONFLICT);

    const newMembership = this.membershipRepository.create({
      package_type: body.packageType,
      package_price: body.packagePrice,
      end_date: endDate,
    });

    await this.membershipRepository.save({ ...newMembership, workspace: { id: workspaceId } });

    return { result: true };
  }

  // 멤버십 조회
  async getMyMembership(workspaceId: number): Promise<Membership> {
    const myMembership = await this.membershipRepository.findOne({ where: { workspace: { id: workspaceId } } });

    if (!myMembership) throw new HttpException('결제된 멤버십이 없습니다.', HttpStatus.NOT_FOUND);

    return myMembership;
  }

  // 만료된 멤버십 삭제
  async deleteExpiredMembership(): Promise<IResult> {
    const expiredMembership = await this.membershipRepository.find({
      where: {
        end_date: LessThan(new Date()),
      },
    });
    await this.membershipRepository.remove(expiredMembership);
    return { result: true };
  }

  // 멤버십 연장
  async extensionMembership(body: MembershipDto, workspaceId: number): Promise<IResult> {
    const targetMembership = await this.membershipRepository.findOne({ where: { workspace: { id: workspaceId } } });
    const servicePeriod = body.servicePeriod * 24 * 60 * 60 * 1000;
    const newEndDate = new Date(targetMembership.end_date.getTime() + servicePeriod);

    if (!targetMembership) throw new HttpException('결제된 멤버십이 없습니다.', HttpStatus.NOT_FOUND);

    await this.membershipRepository.save({ ...targetMembership, end_date: newEndDate });
    return { result: true };
  }

  // 멤버십 취소
  async cancelMembership(workspaceId: number): Promise<IResult> {
    const targetMembership = await this.membershipRepository.findOne({ where: { workspace: { id: workspaceId } } });

    if (!targetMembership) throw new HttpException('결제된 멤버십이 없습니다.', HttpStatus.NOT_FOUND);

    await this.membershipRepository.remove(targetMembership);

    return { result: true };
  }
}
