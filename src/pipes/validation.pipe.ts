import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
  } from '@nestjs/common';
  import { validate, ValidationError } from 'class-validator';
  import { plainToClass } from 'class-transformer';
  
  @Injectable()
  export class ValidationPipeCustom implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
      if (!metatype || !this.toValidate(metatype)) {
        return value;
      }
      const object = plainToClass(metatype, value);
      const errors: ValidationError[] = await validate(object);
      const messageErrors = errors.map((item: ValidationError) => {
        return JSON.stringify(item.constraints);
      });
      if (errors.length > 0) {
        throw new BadRequestException(messageErrors.join(';'));
      }
      return value;
    }
  
    private toValidate(metatype: Function): boolean {
      const types: Function[] = [String, Boolean, Number, Array, Object];
      return !types.includes(metatype);
    }
  }
  