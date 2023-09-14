import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MongoIdPipe implements PipeTransform {
  constructor(private readonly i18nService:I18nService){}

  transform(value: string, metadata: ArgumentMetadata) {
    try {
      return new ObjectId(value);
    } catch (error) {
      throw new HttpException(this.i18nService.t("error.ID_NOTVALID"), HttpStatus.BAD_REQUEST);
    }
  }
}
