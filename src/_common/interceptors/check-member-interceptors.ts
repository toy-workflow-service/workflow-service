import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
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
    const { workspaceId } = req.param;

    await this.workspaceService.checkMember(workspaceId, id);

    return next.handle().pipe(tap((data: IResult) => ({ data })));
  }
}
