import { IJwtPayload } from "./jwt-payload.interface";

export interface IJWT {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: Date;
  refreshTokenExpiresIn: Date;
  me: IJwtPayload
}
