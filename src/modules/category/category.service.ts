import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './models';
import { Model, Types } from 'mongoose';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { FilterChildrenCategoryDto } from './dto/filter-children-category.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const parent = await this.findOne({ _id: createCategoryDto.parentId });
    if (parent) {
      await this.categoryModel.updateMany(
        { right: { $gte: parent.right } },
        { $inc: { right: 2 } },
      );

      await this.categoryModel.updateMany(
        { left: { $gt: parent.right } },
        { $inc: { left: 2 } },
      );
    }

    return this.categoryModel.create({
      ...createCategoryDto,
      parentId: new ObjectId(createCategoryDto.parentId),
      left: parent?.right || 1,
      right: parent?.right ? parent.right + 1 : 2,
      dept: parent?.dept ? parent.dept + 1 : 0,
    });
  }

  async findChildren(filter: FilterChildrenCategoryDto) {
    const category = await this.categoryModel.findById(filter._id);
    return this.categoryModel.find({
      dept: { $lte: filter.dept },
      left: { $gt: category.left },
      right: { $lt: category.right },
    });
  }

  findAll() {
    return this.categoryModel.find();
  }

  findOne(condition: FilterCategoryDto): Promise<Category> {
    return this.categoryModel.findOne(condition);
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }

  find(filter: FilterCategoryDto) {
    return this.categoryModel.find(filter);
  }
}
