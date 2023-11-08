import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { Product } from '../product/models';
import {
  CreateOrderDetailDto,
  CreateOrderDto,
  FilterOrderDetailDto,
  UpdateCartDto,
} from './dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { CartAction, OrderStatus } from './enum';
import {
  Order,
  OrderDetail,
  OrderDetailDocument,
  OrderDocument,
} from './model';
import { Account } from '../auth/model';
import { WarehouseReceiptService } from '../warehouse_receipt/warehouse_receipt.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class OrderService {
  public readonly orderSteps: OrderStatus[] = [
    OrderStatus.CART,
    OrderStatus.PENDING,
    OrderStatus.PREPARES_PACKAGE,
    OrderStatus.IN_TRANSPORT,
    OrderStatus.SUCCESS,
  ];

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderDetail.name)
    private orderDetailModel: Model<OrderDetailDocument>,
    private warehouseReceiptService: WarehouseReceiptService,
    private i18nService: I18nService,
  ) {}

  createOrder(createOrderDto: CreateOrderDto) {
    return this.orderModel.create(createOrderDto);
  }

  updateOneOrder(filter: FilterOrderDto, data: any) {
    return this.orderModel.updateOne(filter, data);
  }

  createOrderDetail(
    orderId: Types.ObjectId,
    createOrderDetailDto: CreateOrderDetailDto[],
  ) {
    const orderDetail = _.map(createOrderDetailDto, (item) => {
      return { ...item, orderId, productId: new ObjectId(item.productId) };
    });
    return this.orderDetailModel.create(orderDetail);
  }

  removeOrderDetailByOrderId(orderId: Types.ObjectId) {
    return this.orderDetailModel.deleteMany({ orderId });
  }

  findOneBy(filterOrderDto: FilterOrderDto): Promise<Order> {
    return this.orderModel.findOne(filterOrderDto);
  }

  findOneById(orderId: Types.ObjectId) {
    return this.orderModel
      .findById(orderId)
      .populate('ownerId', '-password', Account.name)
      .populate('merchandiserId', '-password', Account.name)
      .exec();
  }

  findOneOrderDetail(filter: FilterOrderDetailDto): Promise<OrderDetail> {
    return this.orderDetailModel
      .findOne(filter)
      .populate('orderId', '', Order.name)
      .populate('productId', '', Product.name)
      .exec();
  }

  findOrderDetail(filter: FilterOrderDetailDto): Promise<OrderDetail[]> {
    return this.orderDetailModel
      .find(filter)
      .populate('orderId', '', Order.name)
      .populate('productId', '', Product.name)
      .exec();
  }

  findOneAndUpdateUpsertOrderDetail(
    filter: FilterOrderDetailDto,
    data: any,
  ): Promise<OrderDetail> {
    return this.orderDetailModel.findOneAndUpdate(filter, data, {
      upsert: true,
      new: true,
    });
  }

  findOneByIdAndUpdateOrder(id: Types.ObjectId, data: any) {
    return this.orderModel.findOneAndUpdate({ _id: id }, data, { new: true });
  }

  findOneAndDeleteOrderDetail(filter: FilterOrderDetailDto) {
    return this.orderDetailModel
      .findOneAndDelete(filter)
      .populate('orderId', '', Order.name)
      .exec();
  }

  async updateOrderDetailByCartAction(
    updateCartDto: UpdateCartDto,
    cart: Order,
    product: Product,
  ) {
    switch (updateCartDto.action) {
      case CartAction.ADD:
        let checkingOrderDetail = await this.findOneOrderDetail({
          orderId: cart._id,
          productId: new ObjectId(updateCartDto.productId),
        });
        const inventoryProductQuantity =
          await this.warehouseReceiptService.productQuantityByProductId(
            new ObjectId(updateCartDto.productId),
          );
        const checkingQuantity = checkingOrderDetail
          ? ++checkingOrderDetail.quantity
          : 1;

        if (checkingQuantity > inventoryProductQuantity)
          throw new HttpException(
            this.i18nService.t('order.ERROR.PRODUCT_DONT_ENOUGHT_QUANTITY'),
            HttpStatus.BAD_REQUEST,
          );

        await this.findOneAndUpdateUpsertOrderDetail(
          {
            orderId: cart._id,
            productId: new ObjectId(updateCartDto.productId),
          },
          {
            ...updateCartDto,
            productId: new ObjectId(updateCartDto.productId),
            orderId: cart._id,
            $inc: { quantity: 1, amount: product.price },
          },
        );
        await this.updateOneOrder(
          { _id: cart._id },
          {
            $inc: {
              totalQuantity: 1,
              totalAmountBeforeDiscount: product.price,
              totalAmountAfterDiscount: product.price,
            },
          },
        );

        break;
      case CartAction.MINUS:
        const orderDetail = await this.findOneOrderDetail({
          orderId: cart._id,
          productId: new ObjectId(updateCartDto.productId),
        });
        if (orderDetail.quantity <= 1) {
          await this.findOneAndDeleteOrderDetail({
            orderId: cart._id,
            productId: new ObjectId(updateCartDto.productId),
          });
        } else {
          await this.findOneAndUpdateUpsertOrderDetail(
            {
              orderId: cart._id,
              productId: new ObjectId(updateCartDto.productId),
            },
            {
              ...updateCartDto,
              productId: new ObjectId(updateCartDto.productId),
              $inc: { quantity: -1, amount: -product.price },
            },
          );
        }
        await this.updateOneOrder(
          { _id: cart._id },
          {
            $inc: {
              totalQuantity: -1,
              totalAmountBeforeDiscount: -product.price,
              totalAmountAfterDiscount: -product.price,
            },
          },
        );
        break;
      default:
    }
  }

  findAllExceptCart() {
    return this.orderModel
      .find({ status: { $ne: OrderStatus.CART } })
      .sort([['createdAt', -1]]);
  }

  findPurchaseHistory(ownerId: Types.ObjectId) {
    return this.orderModel
      .find({ ownerId, status: { $ne: OrderStatus.CART } })
      .sort({ createdAt: -1 });
  }
}
