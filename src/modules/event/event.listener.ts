import { OnEvent } from '@nestjs/event-emitter';
import { OrderEventDto } from './dto';
import { envConfig } from '@configs/env.config';
import { ProductService } from '../product/product.service';

export class EventListener {
  constructor(private productService: ProductService) {}

  @OnEvent('order.prepares_package')
  async handlePreparesPackageOrder(payload: OrderEventDto) {
    const outStockProducts =
      await this.productService.findByIdsWithQuantityLessThenEqual(
        payload.productIds,
        +envConfig.MINIMUM_PRODUCT_QUANTITY,
      );
      console.log(outStockProducts);
    if (outStockProducts.length > 0) {
    }
  }
}
