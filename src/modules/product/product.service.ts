import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { PaginateRes } from 'src/shared/model/paginate-res.model';
import { calculateOffset } from 'src/utils/data';
import { CategoryService } from '../category/category.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProduct } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './models';

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
    return this.productModel.aggregate([
      {
        $lookup: {
          from: 'media',
          localField: '_id',
          foreignField: 'ownerId',
          as: 'media',
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categories',
        },
      },
      {
        $addFields: {
          categoryId: {
            $first: '$categories',
          },
        },
      },
    ]);
  }

  async findOne(id: string) {
    const [data] = await this.productModel
      .aggregate()
      .match({ _id: new ObjectId(id) })
      .lookup({
        from: 'media',
        localField: '_id',
        foreignField: 'ownerId',
        as: 'media',
      });
    return data;
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

  async find(filter: FilterProduct): Promise<PaginateRes<Product>> {
    const limit = filter.limit;
    const page = filter.page;
    delete filter.limit;
    delete filter.page;
    let condition: any = filter;

    if (filter.categoryId) {
      const category = await this.categoryService.findById(filter.categoryId);

      const categoryChildren = await this.categoryService.find({
        left: { $gt: category.left },
        right: { $lt: category.right },
      });

      const categoryIds = _.map(categoryChildren, (i) => new ObjectId(i._id));
      condition.categoryId = {
        $in: [...categoryIds, new ObjectId(category._id)],
      };
    }

    let orderBy = {};
    if (filter.order) {
      orderBy[filter.order] = filter.dir;
      delete filter.order;
      delete filter.dir;
    } else {
      orderBy['price'] = 'desc';
    }

    if (filter.name) {
      condition.name = { $regex: '.*' + filter.name + '.*', $options: 'i' };
    }

    const totalProducts = await this.productModel.countDocuments(condition);
    const offset = calculateOffset(totalProducts, Number(limit), Number(page));

    const result = await this.productModel
      .aggregate()
      .match(condition)
      .lookup({
        from: 'media',
        localField: '_id',
        foreignField: 'ownerId',
        as: 'media',
      })
      .lookup({
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories',
      })
      .addFields({
        categoryId: {
          $first: '$categories',
        },
      })
      .sort(orderBy)
      .skip(offset.offset)
      .limit(Number(limit));
    return {
      data: result,
      totalPages: offset.totalPages,
      limit: limit,
      page: page,
      totalRecords: totalProducts,
    };
  }
}
