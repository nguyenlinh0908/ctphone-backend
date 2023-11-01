import { Injectable } from '@nestjs/common';
import { CreateMediaDto, UpdateMediaDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Media, MediaDocument } from './models/upload.model';
import { Model, Types } from 'mongoose';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
  ) {}
  create(data: CreateMediaDto) {
    return this.mediaModel.create(data);
  }

  updateMultipleByIds(data: UpdateMediaDto) {
    const ids = data.mediaIds;
    delete data.mediaIds;

    return this.mediaModel.updateMany({ _id: { $in: ids } }, { $set: data });
  }
}
