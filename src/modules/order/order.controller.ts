import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateCartDto } from './dto';
import { CurrentUser, Roles } from '../auth/decorator';
import { IJwtPayload } from '../auth/interface';
import { RoleType } from '../auth/enum';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { OrderStatus } from './enum';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { ProductService } from '../product/product.service';
import { I18nService } from 'nestjs-i18n';

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
    const createOrderDto: CreateOrderDto = {
      ownerId: currentUser._id,
      products: [],
    };
    const product = await this.productService.findById(updateCartDto.productId);

    if (!product)
      throw new HttpException(
        this.i18nService.t('product.ERROR.PRODUCT_NOT_EXIST'),
        HttpStatus.BAD_REQUEST,
      );

    const cartExisted = await this.orderService.findOneBy({
      ownerId: createOrderDto.ownerId,
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
  myCart(@CurrentUser() currentUser: IJwtPayload) {
    return this.orderService.findOneBy({
      ownerId: currentUser._id.toString(),
      status: OrderStatus.CART,
    });
  }

  @Roles(RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('cart/detail/:orderId')
  cartDetail(@Param('orderId') orderId: string) {
    return this.orderService.findOrderDetail({ orderId });
  }
}