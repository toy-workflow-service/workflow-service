import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceMembersService } from './workspace-members.service';

describe('WorkspaceMembersService', () => {
  let service: WorkspaceMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceMembersService],
    }).compile();

    service = module.get<WorkspaceMembersService>(WorkspaceMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
