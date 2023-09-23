import { Types } from 'mongoose';
import { ProductStatus } from '../enum';
import {
  IsEmpty,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmpty()
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  colorName: string;

  @IsString()
  @IsNotEmpty()
  colorCode: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @IsNotEmpty()
  ram: number;

  @IsString()
  @IsNotEmpty()
  ramUnit: string;

  @IsNumber()
  @IsNotEmpty()
  rom: number;

  @IsString()
  @IsNotEmpty()
  romUnit: string;

  @IsNotEmpty()
  @IsEnum(ProductStatus)
  status: ProductStatus = ProductStatus.OUT_STOCK;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: Types.ObjectId;
}
