import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { Roles } from '../auth/decorator';
import { RoleType } from '../auth/enum';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProduct } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import * as _ from 'lodash';

@UseInterceptors(ResTransformInterceptor)
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly mediaService: UploadService,
  ) {}

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    const mediaMongoIds = _.map(
      createProductDto.mediaIds,
      (item) => new ObjectId(item),
    );
    await this.mediaService.updateMultipleByIds({
      mediaIds: mediaMongoIds,
      ownerId: product._id,
    });
    return product;
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('all')
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get()
  find(@Query() filter: FilterProduct) {
    if (filter.categoryId) filter.categoryId = new ObjectId(filter.categoryId);
    return this.productService.find(filter);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  changeStatus(
    @Param('id') id: Types.ObjectId,
    @Body('status') enable: boolean,
  ) {
    return this.productService.updateStatus(id, enable);
  }
}
