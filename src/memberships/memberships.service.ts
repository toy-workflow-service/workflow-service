import { Injectable } from '@nestjs/common';
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

    const newMembership = this.membershipRepository.create({
      package_type: body.packageType,
      package_price: body.packagePrice,
      end_date: endDate,
      workspace: { id: workspaceId },
    });

    await this.membershipRepository.save(newMembership);

    return { result: true };
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

    await this.membershipRepository.update({ workspace: { id: workspaceId } }, { end_date: newEndDate });

    return { result: true };
  }
}
