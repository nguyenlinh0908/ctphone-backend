import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';
import { CurrentUser, Roles } from '../auth/decorator';
import { IJwtPayload } from '../auth/interface';
import { RoleType } from '../auth/enum';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { OrderStatus } from './enum';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('cart')
  async updateCart(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    createOrderDto.ownerId = currentUser._id;
    const cartExisted = await this.orderService.findOneBy({
      ownerId: createOrderDto.ownerId,
      status: OrderStatus.CART,
    });

    if (cartExisted) {
      await this.orderService.removeOrderDetailByOrderId(cartExisted.id);
      this.orderService.createOrderDetail(
        cartExisted.id,
        createOrderDto.products,
      );
      return cartExisted;
    }

    const createdOrder = await this.orderService.createOrder(createOrderDto);
    if (!createdOrder)
      throw new HttpException('create order fail', HttpStatus.BAD_REQUEST);
    this.orderService.createOrderDetail(
      createdOrder._id.toString(),
      createOrderDto.products,
    );
    return createdOrder;
  }
}
