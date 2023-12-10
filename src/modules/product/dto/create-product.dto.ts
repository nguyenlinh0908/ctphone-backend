import {
  IsEmpty,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

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

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsOptional()
  startingPrice?: number
  
  @IsMongoId()
  @IsNotEmpty()
  categoryId: Types.ObjectId;

  mediaIds: Types.ObjectId[];
}
