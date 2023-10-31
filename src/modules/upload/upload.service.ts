import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Media, MediaDocument } from './models/upload.model';
import { Model } from 'mongoose';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
  ) {}
  create(data: CreateMediaDto) {
    return this.mediaModel.create(data);
  }
}
