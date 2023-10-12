import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Order,
  OrderDetail,
  OrderDetailDocument,
  OrderDocument,
} from './model';
import { Model, Types } from 'mongoose';
import {
  CreateOrderDetailDto,
  CreateOrderDto,
  FilterOrderDetailDto,
  UpdateCartDto,
} from './dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import * as _ from 'lodash';
import { CartAction } from './enum';
import { Product } from '../product/models';

@Injectable()
export class OrderService {
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
      return { ...item, orderId };
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

  findOneByIdAndUpdateOrder(id: Types.ObjectId,data:any){
    return this.orderModel.findOneAndUpdate({_id: id}, data, {new:true})
  }

  findOneAndDeleteOrderDetail(filter: FilterOrderDetailDto) {
    return this.orderDetailModel
      .findOneAndDelete(filter)
      .populate('orderId', '', Order.name).exec();
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
            orderId: cart._id.toString(),
            productId: updateCartDto.productId,
          },
          {
            ...updateCartDto,
            orderId: cart._id.toString(),
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
          orderId: cart._id.toString(),
          productId: updateCartDto.productId,
        });
        if (orderDetail.quantity <= 1) {
          await this.findOneAndDeleteOrderDetail({
            orderId: cart._id.toString(),
            productId: updateCartDto.productId,
          });
        } else {
          await this.findOneAndUpdateUpsertOrderDetail(
            {
              orderId: cart._id.toString(),
              productId: updateCartDto.productId,
            },
            {
              ...updateCartDto,
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
}
