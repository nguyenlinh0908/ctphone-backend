import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { CurrentUser, Roles } from '../auth/decorator';
import { RoleType } from '../auth/enum';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { IJwtPayload } from '../auth/interface';
import { ProductService } from '../product/product.service';
import {
  CreateOrderDto,
  FilterOrderDto,
  UpdateCartDto,
  UpdateOrderStatusDto,
} from './dto';
import { OrderStatus, PaymentStatus } from './enum';
import { OrderService } from './order.service';
import { v4 as uuidV4 } from 'uuid';
import * as _ from 'lodash';

@UseInterceptors(ResTransformInterceptor)
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly i18nService: I18nService,
  ) {}

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('cart')
  async updateCart(
    @Body() updateCartDto: UpdateCartDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const orderCode = uuidV4({
      msecs: new Date().getTime(),
    });

    const createOrderDto: CreateOrderDto = {
      ownerId: new ObjectId(currentUser._id),
      code: orderCode,
      products: [],
    };
    const product = await this.productService.findById(updateCartDto.productId);
    if (!product)
      throw new HttpException(
        this.i18nService.t('product.ERROR.PRODUCT_NOT_EXIST'),
        HttpStatus.BAD_REQUEST,
      );

    const cartExisted = await this.orderService.findOneBy({
      ownerId: new ObjectId(createOrderDto.ownerId),
      status: OrderStatus.CART,
    });

    if (cartExisted) {
      await this.orderService.updateOrderDetailByCartAction(
        updateCartDto,
        cartExisted,
        product,
      );
      return cartExisted;
    }

    const createdOrder = await this.orderService.createOrder(createOrderDto);
    await this.orderService.updateOrderDetailByCartAction(
      updateCartDto,
      createdOrder,
      product,
    );
    if (!createdOrder)
      throw new HttpException('create order fail', HttpStatus.BAD_REQUEST);

    return createdOrder;
  }

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('cart')
  async myCart(@CurrentUser() currentUser: IJwtPayload) {
    const result = await this.orderService.findOneBy({
      ownerId: new ObjectId(currentUser._id),
      status: OrderStatus.CART,
    });

    return result ? result : {};
  }

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('cart/detail/:orderId')
  cartDetail(@Param('orderId') orderId: Types.ObjectId) {
    return this.orderService.findOrderDetail({
      orderId: new ObjectId(orderId),
    });
  }

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('cart/detail/:orderDetailId')
  async deleteOrderDetail(@Param('orderDetailId') orderDetailId: string) {
    const deletedOrderDetail =
      await this.orderService.findOneAndDeleteOrderDetail({
        _id: new ObjectId(orderDetailId),
      });

    await this.orderService.updateOneOrder(
      { _id: deletedOrderDetail.orderId._id, status: OrderStatus.CART },
      {
        $inc: {
          totalQuantity: -deletedOrderDetail.quantity,
          totalAmountBeforeDiscount: -deletedOrderDetail.amount,
          totalAmountAfterDiscount: -deletedOrderDetail.amount,
        },
      },
    );
    return deletedOrderDetail;
  }

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/checkout')
  async updateOrder(@Param('id') id: Types.ObjectId) {
    const order = await this.orderService.findOneBy({ _id: id });

    if (!order)
      throw new HttpException(
        this.i18nService.t('order.ERROR.ORDER_NOT_FOUND'),
        HttpStatus.BAD_REQUEST,
      );
    if (order.status != OrderStatus.CART)
      throw new HttpException(
        'order.ERROR.ORDER_STATUS_INVALID',
        HttpStatus.BAD_REQUEST,
      );

    return this.orderService.findOneByIdAndUpdateOrder(id, {
      status: OrderStatus.PENDING,
    });
  }

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('purchase_history')
  myOrders(@CurrentUser() currentUser: IJwtPayload) {
    return this.orderService.findPurchaseHistory(new ObjectId(currentUser._id));
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('cms')
  order() {
    return this.orderService.findOrdersInCms();
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/confirm')
  async changeStatus(
    @Param('id') orderId: Types.ObjectId,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const order = await this.orderService.findOneBy({ _id: orderId });
    if (!order)
      throw new HttpException(
        this.i18nService.t('order.ERROR.ORDER_NOT_FOUND'),
        HttpStatus.BAD_REQUEST,
      );

    const updateOrderStatusDtoIdx = _.indexOf(
      this.orderService.orderSteps,
      updateOrderStatusDto.status,
    );

    const orderStatusIdx = _.indexOf(
      this.orderService.orderSteps,
      order.status,
    );

    if (orderStatusIdx >= updateOrderStatusDtoIdx)
      throw new HttpException(
        this.i18nService.t('order.ERROR.ORDER_BELOW_LEVEL'),
        HttpStatus.BAD_REQUEST,
      );

    if (updateOrderStatusDtoIdx - orderStatusIdx != 1)
      throw new HttpException(
        this.i18nService.t('order.ERROR.ORDER_STATUS_INVALID'),
        HttpStatus.BAD_REQUEST,
      );

    // auto set payment status success when order status success
    if (updateOrderStatusDto.status == OrderStatus.SUCCESS)
      updateOrderStatusDto.paymentStatus = PaymentStatus.SUCCESS;

    return this.orderService.findOneByIdAndUpdateOrder(orderId, {
      status: updateOrderStatusDto.status,
      merchandiserId: currentUser._id,
      paymentStatus:
        updateOrderStatusDto.paymentStatus && OrderStatus.SUCCESS
          ? updateOrderStatusDto.paymentStatus
          : order.paymentStatus,
    });
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('detail/:orderId')
  async orderDetail(
    @Param('orderId') orderId: Types.ObjectId,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const order = await this.orderService.findOneBy({ _id: orderId });
    if (!order)
      throw new HttpException(
        this.i18nService.t('order.ORDER_NOT_FOUND'),
        HttpStatus.BAD_REQUEST,
      );

    if (
      !_.includes(currentUser.roles, RoleType.ADMIN) &&
      order.ownerId != currentUser._id
    )
      throw new HttpException(
        'order.DONT_PERMISSION_ORDER',
        HttpStatus.BAD_REQUEST,
      );
    return this.orderService.findOrderDetail({
      orderId: order._id,
    });
  }

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':orderId/cancel')
  async cancel(
    @Param('orderId') orderId: Types.ObjectId,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const order = await this.orderService.findOneBy({
      _id: new ObjectId(orderId),
    });
    if (!order)
      throw new HttpException(
        this.i18nService.t('order.ORDER_NOT_FOUND'),
        HttpStatus.BAD_REQUEST,
      );

    if (order.ownerId != currentUser._id)
      throw new HttpException(
        this.i18nService.t('order.DONT_PERMISSION_ORDER'),
        HttpStatus.BAD_REQUEST,
      );

    return this.orderService.findOneByIdAndUpdateOrder(
      new ObjectId(orderId),
      {status: OrderStatus.CANCEL},
    );
  }
}
