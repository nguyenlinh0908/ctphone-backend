import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreateAccountDto } from '../dto';
import { AuthService } from '../auth.service';
import { I18nService } from 'nestjs-i18n';
import { hashString } from 'src/utils/auth';
import { StaffService } from 'src/modules/staff/staff.service';
import { CustomerService } from 'src/modules/customer/customer.service';

@Injectable()
export class RegisterAccountValidatePipe implements PipeTransform {
  constructor(
    private readonly authService: AuthService,
    private readonly staffService: StaffService,
    private readonly customerService: CustomerService,
    private i18nService: I18nService,
  ) {}

  async transform(value: CreateAccountDto, metadata: ArgumentMetadata) {
    const role = await this.authService.findRoleById(value.roleId);
    if (!role)
      throw new HttpException(
        this.i18nService.t('auth.ERROR.ROLE_NOT_EXIST'),
        HttpStatus.BAD_REQUEST,
      );

    if (value?.staffId) {
      const staff = await this.staffService.findById(value.staffId);
      if (!staff)
        throw new HttpException(
          this.i18nService.t('staff.ERROR.STAFF_NOT_EXIST'),
          HttpStatus.BAD_REQUEST,
        );
    }

    if (value?.customerId) {
      const customer = await this.customerService.findById(value.customerId);
      if (!customer)
        throw new HttpException(
          this.i18nService.t('customer.ERROR.CUSTOMER.NOT_EXIST'),
          HttpStatus.BAD_REQUEST,
        );
    }

    const usernameExisted = await this.authService.findByUsername(
      value.username,
    );
    if (usernameExisted)
      throw new HttpException(
        this.i18nService.t('auth.ERROR.USERNAME_EXISTED'),
        HttpStatus.BAD_REQUEST,
      );

    value.password = hashString(value.password);

    return value;
  }
}
