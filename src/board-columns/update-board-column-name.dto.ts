import { PickType } from '@nestjs/mapped-types';
import { CreateBoardColumnDto } from './create-board-column.dto';

export class UpdateBoardColumnNameDto extends PickType(CreateBoardColumnDto, ['name'] as const) {}
