import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IResult } from '../interfaces/result.interface';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Injectable()
export class CheckMemberInterceptor implements NestInterceptor {
  constructor(private readonly workspaceService: WorkspacesService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { id } = req.user;
    const { workspaceId } = req.query;
    if (workspaceId && typeof Number(workspaceId) != 'number') {
      console.log('안들어와??????');
      throw new HttpException('잘못된 접근 입니다. ', HttpStatus.FORBIDDEN);
    }

    if (!workspaceId) {
      const { workspaceId } = req.params;
      if (workspaceId && typeof Number(workspaceId) != 'number') {
        console.log('롤한판 ㄱ???????');
        throw new HttpException('잘못된 접근 입니다. ', HttpStatus.FORBIDDEN);
      }
      await this.workspaceService.checkMember(workspaceId, id);
      return next.handle().pipe(tap((data: IResult) => ({ data })));
    }

    await this.workspaceService.checkMember(workspaceId, id);

    return next.handle().pipe(tap((data: IResult) => ({ data })));
  }
}
