import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Order,
  OrderDetail,
  OrderDetailDocument,
  OrderDocument,
} from './model';
import { Model, Types } from 'mongoose';
import { CreateOrderDetailDto, CreateOrderDto } from './dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import * as _ from 'lodash';

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

  findOneBy(filterOrderDto: FilterOrderDto) {
    return this.orderModel.findOne(filterOrderDto);
  }

  findOneAndUpdateHasUpsertOrderDetailBy() {
    return this.orderDetailModel.findOneAndUpdate(
      { orderId: 1 },
      {},
      { upsert: true },
    );
  }
}
