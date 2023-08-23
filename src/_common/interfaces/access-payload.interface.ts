import * as jwt from 'jsonwebtoken';

export interface AccessPayload extends jwt.JwtPayload {
  id: number;
  name: string;
  email: string;
  profile_url: string;
  phone_number: string;
}
