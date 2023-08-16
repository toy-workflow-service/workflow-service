import { Controller } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';

@Controller('board-columns')
export class BoardColumnsController {
  constructor(private readonly boardColumnsService: BoardColumnsService) {}
}
