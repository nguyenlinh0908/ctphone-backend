import { Types } from 'mongoose';
import { CartAction } from '../enum';

export class UpdateCartDto {
  productId: Types.ObjectId;

  action: CartAction;
}
