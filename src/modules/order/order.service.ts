import { Injectable } from '@nestjs/common';
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

  findOrdersInCms() {
    return this.orderModel.find().sort([['createdAt', -1]]);
  }

  findPurchaseHistory(ownerId: Types.ObjectId) {
    return this.orderModel
      .find({ ownerId, status: { $ne: OrderStatus.CART } })
      .sort({ createdAt: -1 });
  }
}
