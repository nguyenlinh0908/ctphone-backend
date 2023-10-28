import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './models';
import { Model, Types } from 'mongoose';
import { FilterProduct } from './dto/filter-product.dto';
import { PaginateFilter } from 'src/shared/model/paginate-filter.model';
import { calculateOffset } from 'src/utils/data';
import { CategoryService } from '../category/category.service';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { Category } from '../category/models';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoryService: CategoryService,
  ) {}
  create(createProductDto: CreateProductDto) {
    return this.productModel.create({
      ...createProductDto,
      categoryId: new ObjectId(createProductDto.categoryId),
    });
  }

  findAll() {
    return this.productModel.find().populate('categoryId', '', Category.name);
  }

  findOne(id: string) {
    return this.productModel.findById(id);
  }

  findById(id: Types.ObjectId): Promise<Product> {
    return this.productModel.findById(id);
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  updateStatus(id: Types.ObjectId, enable: boolean) {
    return this.productModel.findByIdAndUpdate(id, { enable }, { new: true });
  }

  find(filter: FilterProduct) {
    const offset = calculateOffset(
      0,
      Number(filter.limit),
      Number(filter.page),
    );

    const limit = filter.limit;
    delete filter.limit;
    delete filter.page;
    const condition = filter;
    return this.productModel
      .find(condition)
      .populate('categoryId', '', Category.name)
      .skip(offset.offset)
      .limit(Number(limit));
  }
}
