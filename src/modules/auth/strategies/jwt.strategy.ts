import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import appEnv from '@configs/env.config';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly i18nService: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appEnv().jwt.AUTH_JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req, payload): Promise<any> {
    const accessToken = req.headers?.authorization?.split(' ')[1];
    const token = await this.authService.isAccessTokenLoggedOut(accessToken)
    if (token)
      throw new HttpException(
        this.i18nService.t('auth.ERROR.INVALID_TOKEN'),
        HttpStatus.UNAUTHORIZED,
      );

    if (!payload) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
