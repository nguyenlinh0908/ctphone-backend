import { IJwtPayload } from "./jwt-payload.interface";

export interface IJWT {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  me: IJwtPayload
}
