import { Request } from 'express';
import { User } from '../entities/user.entitiy';

export interface RequestInfo extends Request {
  user?: User;
  file: any;
}
