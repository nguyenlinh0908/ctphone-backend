import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import envConfig from 'src/configs/env.config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidV4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './models/upload.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: envConfig().upload.MULTER_DEST,
        storage: diskStorage({
          // Destination storage path details
          destination: (req: any, file: any, cb: any) => {
            const uploadPath = envConfig().upload.MULTER_DEST;
            // Create folder if doesn't exist
            if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
          },
          // File modification details
          filename: (req: any, file: any, cb: any) => {
            // Calling the callback passing the random name generated with the original extension name
            cb(null, `${uuidV4()}${extname(file.originalname)}`);
          },
        }),
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
