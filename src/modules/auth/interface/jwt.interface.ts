import { User } from 'src/modules/user/model';

export interface IJWT {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: Date;
  refreshTokenExpiresIn: Date;
  account?: User;
}
