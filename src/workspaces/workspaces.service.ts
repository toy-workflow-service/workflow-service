import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWorkspaceDto, InvitationDto, SetRoleDto, UpdateWorkspaceDto } from 'src/_common/dtos/workspace.dto';
import { Workspace_Member } from 'src/_common/entities/workspace-member.entity';
import { Workspace } from 'src/_common/entities/workspace.entity';
import { IResult } from 'src/_common/interfaces/result.interface';
import { MailService } from 'src/_common/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(Workspace_Member)
    private workspaceMemberRepository: Repository<Workspace_Member>,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
  ) {}

  // 워크스페이스 생성
  // 생성과 동시에 생성자의 id값으로 admin권한을 가진 멤버에 추가
  async createWorkspace(body: CreateWorkspaceDto, userId: number): Promise<IResult> {
    const entityManager = this.workspaceRepository.manager;
    try {
      await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
        const newWorkspace = this.workspaceRepository.create({
          ...body,
          user: { id: userId },
        });

        await transactionEntityManager.save(Workspace, newWorkspace);

        const newMember = this.workspaceMemberRepository.create({
          user: { id: userId },
          workspace: { id: newWorkspace.id },
          //role 정보 : 1.Admin, 2.Manager, 3.Member, 4.Outsourcing
          role: 1,
          participation: 1,
        });

        await transactionEntityManager.save(Workspace_Member, newMember);
      });

      return { result: true };
    } catch (err) {
      console.error(err);
    }
  }

  // 워크스페이스 전체조회
  async getAllWorkspaces(): Promise<Workspace[]> {
    return await this.workspaceRepository.find();
  }

  // 워크스페이스 상세조회
  async getWorkspaceDetail(workspaceId: number): Promise<Workspace> {
    const existWorkspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['workspace_members'],
    });

    return existWorkspace;
  }

  // 워크스페이스 수정
  async updateWorkspace(body: UpdateWorkspaceDto, workspaceId: number): Promise<IResult> {
    const existWorkspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });

    if (!existWorkspace) throw new HttpException('해당 워크스페이스가 존재하지 않습니다.', HttpStatus.NOT_FOUND);

    await this.workspaceRepository.update(
      { id: workspaceId },
      { name: body.name, type: body.type, description: body.description },
    );

    return { result: true };
  }

  // 워크스페이스 삭제
  async deleteWorkspace(workspaceId: number): Promise<IResult> {
    const existWorkspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });

    if (!existWorkspace) throw new HttpException('해당 워크스페이스가 존재하지 않습니다.', HttpStatus.NOT_FOUND);

    const entityManager = this.workspaceRepository.manager;

    try {
      await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
        const members = await this.workspaceMemberRepository.find({ where: { id: workspaceId } });

        await transactionEntityManager.remove(Workspace_Member, members);
        await transactionEntityManager.remove(Workspace, existWorkspace);
      });
      return { result: true };
    } catch (err) {
      console.error(err);
    }
  }

  // 워크스페이스 멤버초대
  async inviteWorkspaceMember(body: InvitationDto, workspaceId: number, userName: string): Promise<IResult> {
    const existWorkspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
    const entityManager = this.workspaceRepository.manager;

    if (!existWorkspace) throw new HttpException('해당 워크스페이스가 존재하지 않습니다.', HttpStatus.NOT_FOUND);

    const { id } = await this.userService.findUserByEmail(body.email);

    const existMember = await this.workspaceMemberRepository.findOne({
      where: { user: { id }, workspace: { id: workspaceId } },
    });

    if (existMember) throw new HttpException('이미 초대된 유저입니다.', HttpStatus.CONFLICT);
    try {
      await entityManager.transaction(async (transactionEntityManager: EntityManager) => {
        await this.mailService.inviteProjectMail(body.email, userName, existWorkspace.name, workspaceId);

        await transactionEntityManager.save(Workspace_Member, {
          workspace: { id: workspaceId },
          user: { id },
          role: body.role,
        });
      });
      return { result: true };
    } catch (err) {
      console.error(err);
    }
  }

  // 멤버 권한 변경
  async setMemberRole(body: SetRoleDto, workspaceId: number, userId: number): Promise<IResult> {
    const existMember = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId } },
    });

    if (!existMember) throw new HttpException('해당 멤버가 존재하지 않습니다.', HttpStatus.NOT_FOUND);

    await this.workspaceMemberRepository.update(
      { user: { id: userId }, workspace: { id: workspaceId } },
      { role: body.role },
    );

    return { result: true };
  }

  // 초대 수락 시 참여자 상태 true로 변경
  async acceptInvitaion(workspaceId: number, email: any): Promise<IResult> {
    const { id } = await this.userService.findUserByEmail(email);

    await this.workspaceMemberRepository.update(
      { workspace: { id: workspaceId }, user: { id } },
      { participation: true },
    );

    return { result: true };
  }

  // 워크스페이스 소유자 체크
  async checkAdmin(workspaceId: number, userId: number): Promise<IResult> {
    const checkAdmin = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId }, participation: true },
    });

    if (checkAdmin.role !== 1) throw new HttpException('해당 권한이 없습니다.', HttpStatus.UNAUTHORIZED);

    return { result: true };
  }

  // 워크스페이스 권한 체크
  async checkAuth(workspaceId: number, userId: number): Promise<IResult> {
    const checkRole = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId }, participation: true },
    });

    if (checkRole.role !== 1 && checkRole.role !== 2)
      throw new HttpException('해당 권한이 없습니다.', HttpStatus.UNAUTHORIZED);

    return { result: true };
  }

  // 워크스페이스 멤버체크
  async checkMember(workspaceId: number, userId: number): Promise<IResult> {
    const checkMember = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId }, participation: true },
    });

    if (!checkMember) throw new HttpException('워크스페이스 멤버가 아닙니다.', HttpStatus.UNAUTHORIZED);

    return { result: true };
  }
}
