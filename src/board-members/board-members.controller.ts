import { Controller } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';

@Controller('board-members')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}
}
