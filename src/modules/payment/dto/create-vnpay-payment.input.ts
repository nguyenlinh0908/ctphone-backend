import { Types } from 'mongoose';

export class CreateVnpayPaymentInput {
  orderId: Types.ObjectId;

  bankCode?: string;
}
