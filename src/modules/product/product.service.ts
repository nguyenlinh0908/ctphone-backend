import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './models';
import { Model } from 'mongoose';
import { FilterProduct } from './dto/filter-product.dto';
import { PaginateFilter } from 'src/shared/model/paginate-filter.model';
import { calculateOffset } from 'src/utils/data';
import { CategoryService } from '../category/category.service';
import * as _ from 'lodash';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoryService: CategoryService,
  ) {}
  create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  findAll() {
    return this.productModel.find();
  }

  findOne(id: string) {
    return this.productModel.findById(id);
  }

  findById(id: string) {
    return this.productModel.findById(id);
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  find(filter: FilterProduct, paginate: PaginateFilter) {
    const offset = calculateOffset(
      0,
      Number(paginate.limit),
      Number(paginate.page),
    );

    return this.productModel
      .aggregate()
      .match(filter)
      .limit(Number(paginate.page))
      .skip(offset.offset);
  }

  async findLine(paginate: PaginateFilter, filter: FilterProduct) {
    console.log('filter :>> ', filter);
    const categoryChildren = await this.categoryService.findChildren({
      _id: filter.categoryId,
      dept: 3,
    });
    console.log(categoryChildren);
    const categoryIds = _.map(categoryChildren, (child) => String(child._id));
    const offset = calculateOffset(
      0,
      Number(paginate.limit),
      Number(paginate.page),
    );
    return this.productModel
      .find({ categoryId: { $in: categoryIds } })
      .limit(paginate.limit)
      .skip(offset.offset);
  }
}
