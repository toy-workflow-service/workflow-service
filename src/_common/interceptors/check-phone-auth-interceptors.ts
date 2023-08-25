import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IResult } from '../interfaces/result.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CheckPhoneAuthInterceptor implements NestInterceptor {
  constructor(private readonly userService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { id } = req.user;

    await this.userService.checkPhoneAuth(id);

    return next.handle().pipe(tap((data: IResult) => ({ data })));
  }
}
