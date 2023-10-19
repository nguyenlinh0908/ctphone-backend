import { OrderStatus, PaymentStatus } from '../enum';

export class UpdateOrderStatusDto {
  status: OrderStatus;

  paymentStatus?: PaymentStatus;
}
