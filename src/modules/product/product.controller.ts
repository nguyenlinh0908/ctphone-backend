import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RoleType } from '../auth/enum';
import { Roles } from '../auth/decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { FilterProduct } from './dto/filter-product.dto';
import { PaginateFilter } from 'src/shared/model/paginate-filter.model';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

@UseInterceptors(ResTransformInterceptor)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
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
