import { PickType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';

export class UpdateCardSequenceDto extends PickType(CreateCardDto, ['sequence'] as const) {}
