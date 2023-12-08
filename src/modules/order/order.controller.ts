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
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { v4 as uuidV4 } from 'uuid';
import { CurrentUser, Roles } from '../auth/decorator';
import { AccountType, RoleType } from '../auth/enum';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { IJwtPayload } from '../auth/interface';
import { DeliveryAddressService } from '../delivery_address/delivery_address.service';
import { OrderEventDto } from '../event/dto';
import { ProductService } from '../product/product.service';
import {
  CreateOrderDto,
  FilterOrderDto,
  UpdateCancelOrderDto,
  UpdateCartDto,
  UpdateOrderStatusDto,
} from './dto';
import { OrderStatus, PaymentStatus } from './enum';
import { OrderService } from './order.service';
import { FilterPipe } from './pipes';

@UseInterceptors(ResTransformInterceptor)
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly i18nService: I18nService,
    private readonly deliveryAddressService: DeliveryAddressService,
    private eventEmitter: EventEmitter2,
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
  @Get('cart/:orderId/detail')
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
  async updateOrder(
    @Param('id') id: Types.ObjectId,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const order = await this.orderService.findOneBy({ _id: id });
    const deliveryAddress = await this.deliveryAddressService.findOne({
      accountId: new ObjectId(currentUser._id),
      isDefault: true,
    });
    if (!order)
      throw new HttpException(
        this.i18nService.t('order.ERROR.ORDER_NOT_FOUND'),
        HttpStatus.BAD_REQUEST,
      );
    if (!deliveryAddress)
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
      deliveryAddress,
    });
  }

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('purchase_history')
  myOrders(
    @Query(new FilterPipe()) filter: FilterOrderDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    filter.ownerId = new ObjectId(currentUser._id);
    return this.orderService.findPurchaseHistory(filter);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('all')
  allOrders() {
    return this.orderService.findAllExceptCart();
  }

  @Roles(RoleType.CUSTOMER, RoleType.STAFF, RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  orders(
    @Query(new FilterPipe()) filter: FilterOrderDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    if (currentUser.roles.includes(RoleType.CUSTOMER)) {
      filter.ownerId = new ObjectId(currentUser._id);
    }
    return this.orderService.find(filter);
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

    // check product has enough quantity
    const orderDetails = await this.orderService.findOrderDetail({
      orderId: new ObjectId(orderId),
    });

    if (updateOrderStatusDto.status == OrderStatus.PREPARES_PACKAGE) {
      let isProductValid = true;
      for (const order of orderDetails) {
        const productChecking = await this.productService.findById(
          order.productId._id,
        );
        if (order.quantity > productChecking.quantity) {
          isProductValid = false;
          break;
        }
      }
      if (!isProductValid)
        throw new HttpException(
          this.i18nService.t('order.ERROR.PRODUCT_DONT_ENOUGHT_QUANTITY'),
          HttpStatus.BAD_REQUEST,
        );
    }

    const updatedOrder = await this.orderService.findOneByIdAndUpdateOrder(
      orderId,
      {
        status: updateOrderStatusDto.status,
        merchandiserId: currentUser._id,
        paymentStatus:
          updateOrderStatusDto.paymentStatus && OrderStatus.SUCCESS
            ? updateOrderStatusDto.paymentStatus
            : order.paymentStatus,
      },
    );
    let bulkWrite = [];
    let productIds: Types.ObjectId[] = [];
    if (updatedOrder.status == OrderStatus.PREPARES_PACKAGE) {
      bulkWrite = orderDetails.map((i) => {
        const productId = new ObjectId(i.productId._id);
        productIds.push(productId);
        return {
          updateOne: {
            filter: { _id: productId },
            update: {
              $inc: { quantity: -i.quantity },
            },
          },
        };
      });
      await this.productService.bulkWrite(bulkWrite);
      this.eventEmitter.emit(
        'order.prepares_package',
        new OrderEventDto(productIds),
      );
    }
    return updatedOrder;
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':orderId/detail')
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

  @Roles(RoleType.CUSTOMER, RoleType.ADMIN, RoleType.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':orderId/cancel')
  async cancel(
    @Param('orderId') orderId: Types.ObjectId,
    @CurrentUser() currentUser: IJwtPayload,
    @Body() data: UpdateCancelOrderDto,
  ) {
    const order = await this.orderService.findOneBy({
      _id: new ObjectId(orderId),
    });
    if (!order)
      throw new HttpException(
        this.i18nService.t('order.ORDER_NOT_FOUND'),
        HttpStatus.BAD_REQUEST,
      );

    if ( order.status != OrderStatus.SUCCESS && order.ownerId != currentUser._id)
      throw new HttpException(
        this.i18nService.t('order.DONT_PERMISSION_ORDER'),
        HttpStatus.BAD_REQUEST,
      );
    if (
      order.status == OrderStatus.SUCCESS &&
      currentUser.roles.includes(RoleType.CUSTOMER)
    )
      throw new HttpException(
        this.i18nService.t('order.DONT_PERMISSION_ORDER'),
        HttpStatus.BAD_REQUEST,
      );

    return this.orderService.findOneByIdAndUpdateOrder(new ObjectId(orderId), {
      status: OrderStatus.CANCEL,
      note: data.note,
    });
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async order(
    @Param('id') orderId: Types.ObjectId,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const order = await this.orderService.findOneById(orderId);
    if (
      order.ownerId._id != currentUser._id &&
      currentUser.type == AccountType.CUSTOMER
    )
      throw new HttpException('auth.UNAUTHORIZED', HttpStatus.BAD_REQUEST);
    return order;
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('statistical/quantity')
  async quantity(@Query() query: FilterOrderDto) {
    return {
      quantity: await this.orderService.countDocuments(query),
    };
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('statistical/revenue')
  async revenue() {
    const [result] = await this.orderService.revenue();
    return result;
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('statistical/revenue/months')
  async revenueByMonths() {
    return this.orderService.revenueByMonths();
  }
}
