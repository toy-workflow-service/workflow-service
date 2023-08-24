import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ViewAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();

    const result = this.validate(req.user);
    if (result) return true;
    else return res.redirect('/login');
  }

  validate(user: Request) {
    if (!user) return false;
    return true;
  }
}
