import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentMentionDto {
  @IsString()
  @IsNotEmpty({ message: '댓글이 존재하지 않습니다.' })
  readonly comment: string;

  @IsString()
  readonly receiveName: string;
}

export class CreateBoardMessageMentionDto {
  @IsString()
  @IsNotEmpty({ message: '메세지가 존재하지 않습니다.' })
  readonly message: string;

  @IsString()
  readonly receiveName: string;
}

export class CreateDirectMessageMentionDto {
  @IsString()
  @IsNotEmpty({ message: '메세지가 존재하지 않습니다.' })
  readonly message: string;

  @IsString()
  readonly receiveName: string;
}
