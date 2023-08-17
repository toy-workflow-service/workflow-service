// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { IResult } from '../interfaces/result.interface';

// @Injectable()
// export class CheckPhoneAuthInterceptor implements NestInterceptor {
//   constructor(private readonly ) {}

//   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
//     const req = context.switchToHttp().getRequest();
//     const { id } = req.user;
//     const { projectId, boardId } = req.params;

//     return next.handle().pipe(tap((data: IResult) => ({ data })));
//   }
// }
