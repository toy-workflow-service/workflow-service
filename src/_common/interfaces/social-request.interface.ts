import { Request } from 'express';

type SocialUser = {
  email: string;
  name: string;
  photo: string;
  accessToken: string;
};
export type SocialRequest = Request & { user: SocialUser };
