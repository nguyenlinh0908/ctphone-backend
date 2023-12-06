import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { FilterOrderDto } from '../dto';

@Injectable()
export class FilterPipe implements PipeTransform {
  transform(value: FilterOrderDto, metadata: ArgumentMetadata) {
    if (value?.code) {
      value.code = new RegExp(`.*${value.code}.*`)
    }
    return value;
  }
}
