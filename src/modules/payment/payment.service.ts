import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { envConfig } from '@configs/env.config';
import * as dayjs from 'dayjs';
import { I18nService } from 'nestjs-i18n';
import { CreateVnpayPaymentDto } from './dto';
import * as queryString from 'qs';
import * as crypto from 'crypto';
import { Request } from 'express';
import { OrderService } from '../order/order.service';
import { OrderStatus, PaymentStatus } from '../order/enum';
import { DeliveryAddressService } from '../delivery_address/delivery_address.service';

@Injectable()
export class PaymentService {
  private readonly vnpTmnCode = envConfig.VNPAY_TMN_CODE;
  private readonly vnpSecretKey = envConfig.VNPAY_SECURE_HASH;
  constructor(
    private readonly i18nService: I18nService,
    private orderService: OrderService,
    private deliverAddressService: DeliveryAddressService,
  ) {}

  createPayment(createVnpayPaymentDto: CreateVnpayPaymentDto) {
    let vnpUrl = '';

    const createDate = dayjs().format('YYYYMMDDHHmmss');

    const orderInfo = this.i18nService.t('payment.DESCRIPTION', {
      args: [createVnpayPaymentDto.orderCode],
    });

    const orderType = '250000'; // vnpay pay bill code optional
    const locale = 'vn';
    const currCode = 'VND';

    let vnpParams = {};
    vnpParams['vnp_Version'] = '2.1.0';
    vnpParams['vnp_Command'] = 'pay';
    vnpParams['vnp_TmnCode'] = this.vnpTmnCode;
    // vnpParams['vnp_Merchant'] = ''
    vnpParams['vnp_Locale'] = locale;
    vnpParams['vnp_CurrCode'] = currCode;
    vnpParams['vnp_TxnRef'] = createVnpayPaymentDto.orderCode;
    vnpParams['vnp_OrderInfo'] = orderInfo;
    vnpParams['vnp_OrderType'] = orderType;
    vnpParams['vnp_Amount'] = createVnpayPaymentDto.amount * 100;
    vnpParams['vnp_ReturnUrl'] = envConfig.VNPAY_URL_RETURN;
    vnpParams['vnp_IpAddr'] = createVnpayPaymentDto.ipAddr;
    vnpParams['vnp_CreateDate'] = createDate;
    if (
      createVnpayPaymentDto.bankCode !== null &&
      createVnpayPaymentDto.bankCode !== ''
    ) {
      vnpParams['vnp_BankCode'] = createVnpayPaymentDto.bankCode;
    }
    vnpParams = this.sortObject(vnpParams);
    const signData = queryString.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnpSecretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;
    vnpUrl += '?' + queryString.stringify(vnpParams, { encode: false });
    return `${envConfig.VNPAY_URL}${vnpUrl}`;
  }

  async handleVnpIpn(req: Request) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    let orderCode = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);

    let signData = queryString.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac('sha512', this.vnpSecretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    if (secureHash != signed)
      return { RspCode: '97', Message: 'Checksum failed' };
    const order = await this.orderService.findOneBy({
      code: orderCode.toString(),
    });
    if (!order) return { RspCode: '01', Message: 'order not found' };

    const paymentAmount = vnp_Params['vnp_Amount'];

    if (order.totalAmountAfterDiscount * 100 != Number(paymentAmount))
      return { RspCode: '04', Message: 'Success' };

    if (order.paymentStatus != PaymentStatus.PENDING)
      return {
        RspCode: '02',
        Message: 'This order has been updated to the payment status',
      };

    if (rspCode == '00') {
      const deliveryAddressDefault = await this.deliverAddressService.findOne({
        accountId: order.ownerId,
        isDefault: true,
      });

      await this.orderService.updateOneOrder(
        { _id: order._id },
        {
          paymentStatus: PaymentStatus.SUCCESS,
          status: OrderStatus.PENDING,
          deliveryAddress: deliveryAddressDefault,
        },
      );
      return { RspCode: '00', Message: 'Success' };
    } else {
      await this.orderService.updateOneOrder(
        { _id: order._id },
        { paymentStatus: PaymentStatus.FAIL },
      );
      return { RspCode: '00', Message: 'Success' };
    }
  }

  handleVnpReturn(req: Request) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];
    let tmnCode = vnp_Params['vnp_TmnCode'];
    const orderCode = vnp_Params['vnp_TxnRef'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);

    let signData = queryString.stringify(vnp_Params, { encode: false });
    let crypto = require('crypto');
    let hmac = crypto.createHmac('sha512', this.vnpSecretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    if (secureHash === signed && tmnCode === this.vnpTmnCode) {
      //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
      return { code: vnp_Params['vnp_ResponseCode'] };
    }
    return {
      code: '97',
      message: this.i18nService.t('payment.PAYMENT_SUCCESS_NOTIFY', {
        args: [orderCode],
      }),
    };
  }

  sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
