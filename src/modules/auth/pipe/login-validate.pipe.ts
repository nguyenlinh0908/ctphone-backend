import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { LoginDto } from '../dto';
import { AuthService } from '../auth.service';
import { comparePassword } from 'src/utils/auth';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class LoginValidatePipe implements PipeTransform {
  constructor(private readonly authService: AuthService, private i18nService: I18nService) {}

  async transform(loginData: LoginDto, metadata: ArgumentMetadata) {
    console.log('loginData :>> ', loginData);
    const accountExisted = await this.authService.findByUsername(
      loginData.username,
    );
    if (!accountExisted)
      throw new HttpException(this.i18nService.t("auth.ERROR.ACCOUNT_NOT_FOUND"), HttpStatus.BAD_REQUEST);

    const isPasswordValid = comparePassword(
      loginData.password,
      accountExisted.password,
    );
    if (!isPasswordValid)
      throw new HttpException(
       this.i18nService.t("auth.ERROR.INFORMATION_INVALID"),
        HttpStatus.BAD_REQUEST,
      );

    return loginData;
  }
}
