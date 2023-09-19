import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { RedisCachingService } from 'src/shared/modules/redis-cache/redis-caching.service';
import { CachingName } from 'src/shared/enum/caching-name.enum';
import { ROLES_KEY, Roles } from '../decorator';
import { RoleType } from '../enum';
import { Role } from '../model';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
    private readonly redisCachingService: RedisCachingService,
    private readonly i18nService: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const bearerToken = req?.headers?.authorization;
    const accessToken = _.replace(bearerToken, 'Bearer ', '');
    try {
      const tokenSignOuted = await this.redisCachingService.get(accessToken)
      
      if(tokenSignOuted) throw new HttpException(this.i18nService.t("auth.ERROR.TOKEN_INVALID"), HttpStatus.UNAUTHORIZED)

      const payload = this.authService.verifyJwt(accessToken);
      const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      let roleList = await this.redisCachingService.get(CachingName.ROLE);
      if (!roleList) {
        const allRoles = await this.authService.getAllRoles();
        this.redisCachingService.set({
          key: CachingName.ROLE,
          value: JSON.stringify(allRoles),
          ttl: 60,
        });
        roleList = JSON.stringify(allRoles);
      }

      const rolesArr: Role[] = JSON.parse(roleList);
      const userHasRoles = _.filter(rolesArr, (item) => {
        return _.includes(payload.role, item._id);
      });

      if (requiredRoles.length > 0) {
        const hasPermission = _.some(userHasRoles, (i) =>
          _.includes(requiredRoles, i.code),
        );
        if (!hasPermission)
          throw new HttpException(
            this.i18nService.t('auth.ERROR.UNAUTHORIZED'),
            HttpStatus.UNAUTHORIZED,
          );
      }

      return true;
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }
}
