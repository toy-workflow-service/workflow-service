import { Controller } from '@nestjs/common';
import { MentionsService } from './mentions.service';

@Controller('mentions')
export class MentionsController {
  constructor(private readonly mentionsService: MentionsService) {}
}
