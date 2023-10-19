import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Ip,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { OrderStatus } from '../order/enum';
import { OrderService } from '../order/order.service';
import { CreateVnpayPaymentInput } from './dto';
import { PaymentService } from './payment.service';
import { Request } from 'express';

@UseInterceptors(ResTransformInterceptor)
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderService: OrderService,
    private readonly i18nService: I18nService,
  ) {}

  @Post('vnp/create_payment')
  async vnpCreatePayment(
    @Body() createVnpayPaymentInput: CreateVnpayPaymentInput,
    @Ip() ipAddr: string,
  ) {
    const order = await this.orderService.findOneBy({
      _id: createVnpayPaymentInput.orderId,
    });
    if (!order)
      throw new HttpException(
        this.i18nService.t('order.ERROR.ORDER_NOT_FOUND'),
        HttpStatus.BAD_REQUEST,
      );
    if (order.status != OrderStatus.PENDING)
      throw new HttpException(
        this.i18nService.t('order.ERROR.ORDER_STATUS_INVALID'),
        HttpStatus.BAD_REQUEST,
      );

    return {
      url: this.paymentService.createPayment({
        orderCode: order.code,
        ipAddr: ipAddr,
        amount: order.totalAmountAfterDiscount,
      }),
    };
  }

  @Get('vnpay_ipn')
  vnpIpn(@Req() req: Request) {
    return this.paymentService.handleVnpIpn(req);
  }

  @Get('vnp_return')
  vnpReturn(@Req() req: Request) {
    return this.paymentService.handleVnpReturn(req);
  }
}
