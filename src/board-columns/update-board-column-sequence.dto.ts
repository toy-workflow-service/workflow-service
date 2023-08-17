import { PickType } from '@nestjs/mapped-types';
import { CreateBoardColumnDto } from './create-board-column.dto';

export class UpdateBoardColumnSequenceDto extends PickType(CreateBoardColumnDto, ['sequence'] as const) {}
